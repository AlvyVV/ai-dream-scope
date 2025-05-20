import { getCommentsCount, getTopComments } from '@/models/comment';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const source_code = url.searchParams.get('source_code');
    const limitParam = url.searchParams.get('limit') || '10';
    const offsetParam = url.searchParams.get('offset') || '0';

    const limit = parseInt(limitParam);
    const offset = parseInt(offsetParam);

    if (!source_code) {
      return NextResponse.json({ error: '缺少必要参数：source_code' }, { status: 400 });
    }

    // 获取评论
    const comments = await getTopComments(source_code, limit, offset);

    // 获取评论总数
    const total = await getCommentsCount(source_code);

    return NextResponse.json({
      success: true,
      data: {
        comments,
        total,
        hasMore: total > offset + limit,
      },
    });
  } catch (error: any) {
    console.error('获取评论API错误:', error);

    return NextResponse.json({ error: `获取评论失败: ${error.message || '未知错误'}` }, { status: 500 });
  }
}
