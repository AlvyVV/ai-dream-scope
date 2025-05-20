import { getAllItems } from '@/services/item_config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('获取符号API: 开始处理请求');

    // 获取URL参数
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    console.log('获取符号API: 分类参数:', category);

    // 获取所有项目配置
    const allItems = await getAllItems();
    console.log('获取符号API: 获取到数据条数:', allItems.length);

    // 根据分类筛选数据
    let symbols = allItems;
    if (category) {
      symbols = allItems.filter(item => item.category === category);
      console.log(`获取符号API: 筛选分类 ${category} 后的数据条数:`, symbols.length);
    } else {
      console.log('获取符号API: 未指定分类，返回所有数据');
    }

    // 返回结果
    return NextResponse.json({
      success: true,
      count: symbols.length,
      data: symbols,
    });
  } catch (error) {
    console.error('获取符号API错误:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';

    return NextResponse.json({ success: false, message: `获取符号数据失败: ${errorMessage}` }, { status: 500 });
  }
}
