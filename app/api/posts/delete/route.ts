import { NextRequest, NextResponse } from 'next/server';
import { deleteBlog, findBlogByUuid } from '@/models/blog';


export const runtime = "edge";

/**
 * 处理帖子删除请求
 */
export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const body = await req.json();
    const { uuid } = body;

    if (!uuid) {
      return NextResponse.json({ error: '缺少必要参数：uuid' }, { status: 400 });
    }

    // 获取帖子
    const blog = await findBlogByUuid(uuid);

    if (!blog) {
      return NextResponse.json({ error: '未找到指定的帖子' }, { status: 404 });
    }

    console.log('del UUid', blog);
    // 执行删除操作
    await deleteBlog(uuid);

    // 返回结果
    return NextResponse.json({
      success: true,
      message: '帖子删除成功',
    });
  } catch (error: any) {
    console.error('帖子删除API错误:', error);

    return NextResponse.json(
      { error: `帖子删除失败: ${error.message || '未知错误'}` },
      { status: 500 }
    );
  }
}
