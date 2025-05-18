import { getThreadImageUrl } from '@/models/user-ai-chat';
import { NextRequest, NextResponse } from 'next/server';


export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const url = new URL(request.url);
    const threadId = url.searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 });
    }

    // 获取thread_id对应的图片URL
    const imageUrl = await getThreadImageUrl(threadId);

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image not found for this thread', imageUrl: null }, { status: 404 });
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('获取图片URL时出错:', error);
    return NextResponse.json({ error: 'Internal server error', imageUrl: null }, { status: 500 });
  }
}
