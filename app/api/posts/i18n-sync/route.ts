import { findBlogByUuid } from '@/models/blog';
import { syncBlogI18n } from '@/services/post-i18n-sync';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 处理文章多语言同步请求
 */
export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const body = await req.json();
    const { uuid } = body;

    if (!uuid) {
      return NextResponse.json({ error: '缺少必要参数：uuid' }, { status: 400 });
    }

    // 获取文章
    const blog = await findBlogByUuid(uuid);

    if (!blog) {
      return NextResponse.json({ error: '未找到指定的文章' }, { status: 404 });
    }

    // 检查文章语言是否为英文
    if (blog.locale !== 'en') {
      return NextResponse.json({ error: '只能从英文文章同步到其他语言版本' }, { status: 400 });
    }

    // 执行多语言同步
    const result = await syncBlogI18n(blog);

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
