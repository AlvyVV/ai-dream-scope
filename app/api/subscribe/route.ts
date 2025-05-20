import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 记录日志
    console.log(`[SUBSCRIPTION] 新订阅者: ${email}`);

    // 这里可以添加更多逻辑，比如保存到数据库等

    return NextResponse.json({
      success: true,
      message: 'Subscription successful',
    });
  } catch (error) {
    console.error('订阅错误:', error);
    return NextResponse.json({ success: false, message: 'Subscription failed' }, { status: 500 });
  }
}
