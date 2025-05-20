import { interpretDream } from '@/services/dream';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dream, locale } = body;

    if (!dream) {
      return NextResponse.json({ error: 'Dream content is required' }, { status: 400 });
    }

    const result = await interpretDream({
      dream,
      locale: locale || 'zh',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Dream interpretation error:', error);
    return NextResponse.json({ error: 'Failed to interpret dream' }, { status: 500 });
  }
}
