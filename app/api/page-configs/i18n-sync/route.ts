import { findPageConfigById } from '@/models/page-config';
import { syncPageConfigI18n } from '@/services/i18n-sync';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 处理页面配置多语言同步请求
 */
export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少必要参数：id' }, { status: 400 });
    }

    // 获取页面配置
    const pageConfig = await findPageConfigById(Number(id));

    if (!pageConfig) {
      return NextResponse.json({ error: '未找到指定的页面配置' }, { status: 404 });
    }

    // 执行多语言同步
    const result = await syncPageConfigI18n(pageConfig);

    // 返回同步结果
    return NextResponse.json({
      success: true,
      message: `多语言同步完成: ${result.success.length}个成功, ${result.failed.length}个失败`,
      data: result,
    });
  } catch (error: any) {
    console.error('多语言同步API错误:', error);

    return NextResponse.json({ error: `多语言同步失败: ${error.message || '未知错误'}` }, { status: 500 });
  }
}
