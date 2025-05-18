import { NextRequest, NextResponse } from 'next/server';
import { getCommentReplies } from '@/models/comment';


export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const reply_id_param = url.searchParams.get('reply_id');

    if (!reply_id_param) {
      return NextResponse.json({ error: '缺少必要参数：reply_id' }, { status: 400 });
    }

    const reply_id = parseInt(reply_id_param);

    // 获取评论回复
    const replies = await getCommentReplies(reply_id);

    return NextResponse.json({
      success: true,
      data: replies,
    });
  } catch (error: any) {
    console.error('获取评论回复API错误:', error);

    return NextResponse.json(
      { error: `获取评论回复失败: ${error.message || '未知错误'}` },
      { status: 500 }
    );
  }
}
