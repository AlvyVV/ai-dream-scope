import { auth } from '@/auth';
import { getAdminSupabaseClient } from '@/models/db';
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

    const userUuid = session.user.uuid;

    // 获取Supabase客户端
    const supabase = await getAdminSupabaseClient();

    // 查询用户的所有唯一线程ID
    const { data, error } = await supabase.from('user_ai_chat').select('thread_id, created_at').eq('uuid', userUuid).not('thread_id', 'is', null).order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching threads:', error);
      return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 });
    }

    // 提取唯一线程ID和创建时间
    const uniqueThreads = [];
    const seenThreads = new Set();

    for (const item of data) {
      if (item.thread_id && !seenThreads.has(item.thread_id)) {
        seenThreads.add(item.thread_id);
        uniqueThreads.push({
          id: item.thread_id,
          created_at: item.created_at,
        });
      }
    }

    // 获取每个线程的消息内容
    const threadsWithMessages = await Promise.all(
      uniqueThreads.map(async thread => {
        const messages = await findUserAiChatsByThreadId(thread.id);
        return {
          ...thread,
          messages: messages,
        };
      })
    );

    return NextResponse.json(threadsWithMessages);
  } catch (error) {
    console.error('Error in chat threads API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
