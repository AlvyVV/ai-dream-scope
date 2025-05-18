import { auth } from '@/auth';
import { findUserAiChatsByThreadId } from '@/models/user-ai-chat';
import { NextRequest, NextResponse } from 'next/server';


export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    // 获取当前认证用户
    const session = await auth();
    if (!session || !session.user || !session.user.uuid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取查询参数
    const url = new URL(req.url);
    const threadId = url.searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 });
    }

    // 获取线程消息
    const messages = await findUserAiChatsByThreadId(threadId);

    // 验证这些消息是否属于当前用户（可选，取决于安全需求）
    // 这里可以添加额外的检查，确保用户只能查看自己的消息

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error in chat messages API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
