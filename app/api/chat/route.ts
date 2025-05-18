import { findLatestUserAiChatByUserUuid, insertUserAiChat, updateUserAiChat, updateUserAiChatUuid } from '@/models/user-ai-chat';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === 'create') {
      const chat = await insertUserAiChat({
        ...data,
      });
      return NextResponse.json(chat);
    }

    if (type === 'update') {
      // 根据thread_id更新聊天内容
      if (data.thread_id) {
        const { thread_id, content } = data;
        const chat = await updateUserAiChat(thread_id, { content });
        return NextResponse.json(chat);
      } else {
        return NextResponse.json({ error: '缺少thread_id参数' }, { status: 400 });
      }
    }

    if (type === 'update_uuid') {
      const { old_uuid, new_uuid, thread_id } = data;

      if (!thread_id) {
        return NextResponse.json({ error: '缺少thread_id参数' }, { status: 400 });
      }

      // 使用专门的函数更新uuid
      const chat = await updateUserAiChatUuid(thread_id, new_uuid);

      return NextResponse.json(chat);
    }

    if (type === 'get_latest') {
      const { user_uuid } = data;
      if (!user_uuid) {
        return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
      }

      const chat = await findLatestUserAiChatByUserUuid(user_uuid);
      return NextResponse.json({ chat });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
