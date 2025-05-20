import { publishPageConfigsByCodeAndVersion } from '@/models/page-config';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 处理页面配置发布请求
 */
export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const body = await req.json();
    const { code, version } = body;

    if (!code) {
      return NextResponse.json({ error: '缺少必要参数：code' }, { status: 400 });
    }

    if (!version && version !== 0) {
      return NextResponse.json({ error: '缺少必要参数：version' }, { status: 400 });
    }

    // 执行发布操作
    const result = await publishPageConfigsByCodeAndVersion(code, version);

    // 强制服务端缓存失效
    revalidatePath('/admin/page-configs');

    // 返回发布结果，包括归档信息
    return NextResponse.json({
      success: true,
      message: result.message || `已将 ${code} (版本 ${version}) 的 ${result.count} 条记录发布成功`,
      count: result.count,
      updated: result.updated,
      archived: result.archived || [],
      archived_count: result.archived_count || 0,
    });
  } catch (error: any) {
    console.error('发布API错误:', error);

    return NextResponse.json({ error: `发布失败: ${error.message || '未知错误'}` }, { status: 500 });
  }
}
