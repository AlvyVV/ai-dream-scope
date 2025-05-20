import { createItemConfig } from '@/services/item_config';
import { interpretSymbolByGenmini } from '@/services/symbol';
import { ItemConfig } from '@/types/item-config';
import { SymbolInterpretation } from '@/types/pages/interpretation';
import { NextRequest, NextResponse } from 'next/server';

// 并发控制函数
async function processBatch<T>(items: T[], processFn: (item: T) => Promise<void>, batchSize: number): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processFn));
  }
}

// 保存符号配置
async function saveSymbolConfig(symbol: string, interpretation: SymbolInterpretation) {
  try {
    const itemConfig: Partial<ItemConfig> = {
      code: symbol.replace(/\s+/g, '-').toLowerCase(),
      name: interpretation.symbolIntro.symbolName || symbol,
      category: interpretation.symbolIntro.symbolCategory || 'default',
      tags: interpretation.symbolIntro.meaningPills?.map(pill => pill.text) || [],
      description: interpretation.symbolIntro.quickMeaning || '',
      locale: 'zh-CN',
      page_config: interpretation,
      project_id: process.env.PROJECT_ID,
    };

    console.log('保存符号配置: 准备创建ItemConfig', {
      code: itemConfig.code,
      name: itemConfig.name,
      category: itemConfig.category,
      project_id: itemConfig.project_id,
    });

    const result = await createItemConfig(itemConfig);
    console.log('保存符号配置: ItemConfig创建结果', result);
    return result;
  } catch (error) {
    console.error('保存符号配置失败:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('解析符号API: 开始处理请求');

    // 解析请求体
    const body = await request.json();
    const { symbol } = body;
    console.log('解析符号API: 请求体解析成功, 符号:', symbol);

    // 参数验证
    if (!symbol || typeof symbol !== 'string') {
      console.error('解析符号API: 缺少符号参数或参数类型错误');
      return NextResponse.json({ message: '缺少符号参数或参数类型错误' }, { status: 400 });
    }

    // 分割符号并过滤空值
    const symbols = symbol
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (symbols.length === 0) {
      return NextResponse.json({ message: '没有有效的符号需要解析' }, { status: 400 });
    }

    // 立即返回响应
    const response = NextResponse.json({
      message: '符号解析任务已开始处理',
      totalSymbols: symbols.length,
    });

    // 在后台处理符号
    processBatch(
      symbols,
      async symbol => {
        try {
          console.log(`解析符号API: 开始处理符号 ${symbol}`);
          const interpretation = await interpretSymbolByGenmini(symbol);
          console.log(`解析符号API: 符号 ${symbol} 处理完成`);

          // 解析完成后直接保存
          console.log(`保存符号API: 开始保存符号 ${symbol}`);
          await saveSymbolConfig(symbol, interpretation);
          console.log(`保存符号API: 符号 ${symbol} 保存完成`);
        } catch (error) {
          console.error(`处理符号 ${symbol} 失败:`, error);
        }
      },
      3
    ).catch(error => {
      console.error('批量处理符号时发生错误:', error);
    });

    return response;
  } catch (error) {
    console.error('符号解析API错误:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';

    return NextResponse.json({ message: `符号解析失败: ${errorMessage}` }, { status: 500 });
  }
}
