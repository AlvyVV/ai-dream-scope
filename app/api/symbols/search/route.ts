import { findItemsByName } from '@/services/item_config';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('符号搜索API被调用:', request.url);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const locale = searchParams.get('locale') || 'en';

    console.log('搜索参数:', { query, locale });

    if (!query) {
      console.log('查询为空，返回空结果');
      return NextResponse.json([], { status: 200 });
    }

    // 使用service层的方法搜索符号
    console.log(`开始调用 findItemsByName 查询: "${query}", 语言: ${locale}`);
    const results = await findItemsByName(query, locale);
    console.log(
      `查询结果数量: ${results.length}`,
      results.map(r => ({ id: r.id, code: r.code, name: r.name }))
    );

    return NextResponse.json(results, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('搜索符号API错误:', error);
    console.error('错误堆栈:', error.stack);
    return NextResponse.json({ error: error.message || '搜索符号时发生错误' }, { status: 500 });
  }
}
