import { createItemConfig } from '@/services/item_config';
import { ItemConfig } from '@/types/item-config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('保存符号API: 开始处理请求');

    // 解析请求体
    const body = await request.json();
    console.log('保存符号API: 请求体解析成功');

    // 验证必要字段
    const requiredFields = ['code', 'name', 'category', 'locale', 'page_config'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      console.error('保存符号API: 缺少必要字段', missingFields);
      return NextResponse.json({ message: `缺少必要字段: ${missingFields.join(', ')}` }, { status: 400 });
    }

    // 确保ID值来自环境变量
    const itemConfig: Partial<ItemConfig> = {
      ...body,
      project_id: process.env.PROJECT_ID,
    };

    console.log('保存符号API: 准备创建ItemConfig', {
      code: itemConfig.code,
      name: itemConfig.name,
      category: itemConfig.category,
      project_id: itemConfig.project_id,
    });

    // 调用服务保存ItemConfig
    const result = await createItemConfig(itemConfig);
    console.log('保存符号API: ItemConfig创建结果', result);

    // 返回结果
    return NextResponse.json({
      success: true,
      message: '符号配置保存成功',
      data: result,
    });
  } catch (error) {
    console.error('符号配置保存API错误:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';

    return NextResponse.json({ success: false, message: `符号配置保存失败: ${errorMessage}` }, { status: 500 });
  }
}
