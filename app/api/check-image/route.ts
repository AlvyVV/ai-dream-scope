import { checkThreadHasImage } from '@/models/user-ai-chat';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const url = new URL(request.url);
    const threadId = url.searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 });
    }

    // 检查thread_id对应的记录是否已有图片
    const hasImage = await checkThreadHasImage(threadId);

    return NextResponse.json({ hasImage });
  } catch (error) {
    console.error('检查图片状态时出错:', error);
    return NextResponse.json({ error: 'Internal server error', hasImage: false }, { status: 500 });
  }
}
