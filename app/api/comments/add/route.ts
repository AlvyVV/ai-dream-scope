import { NextRequest, NextResponse } from 'next/server';
import { addComment } from '@/models/comment';
import { Comment } from '@/types/comment';
import { getIsoTimestr } from '@/lib/time';


export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source_code, content, name, email, user_id, reply_id = 0 } = body;

    // 验证必填字段
    if (!source_code || !content) {
      return NextResponse.json({ error: '缺少必要参数：source_code 或 content' }, { status: 400 });
    }

    // 如果没有用户ID，则需要名称和邮箱
    if (!user_id && (!name || !email)) {
      return NextResponse.json({ error: '匿名评论需要提供名称和邮箱' }, { status: 400 });
    }

    // 创建评论对象
    const comment: Partial<Comment> = {
      source_code,
      content,
      reply_id,
      is_deleted: 0,
      created_at: getIsoTimestr(),
      reply_count: 0,
    };

    // 根据情况添加用户信息
    if (user_id) {
      comment.user_id = user_id;
    } else {
      comment.name = name;
      comment.email = email;
    }

    // 添加评论
    const newComment = await addComment(comment);

    return NextResponse.json({
      success: true,
      message: '评论添加成功',
      data: newComment,
    });
  } catch (error: any) {
    console.error('添加评论API错误:', error);

    return NextResponse.json(
      { error: `添加评论失败: ${error.message || '未知错误'}` },
      { status: 500 }
    );
  }
}
