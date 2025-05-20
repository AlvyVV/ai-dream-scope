import { generateDreamPrompt } from '@/aisdk/models/geimini';
import { updateUserAiChaImage } from '@/models/user-ai-chat';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] 开始处理梦境图片生成请求');

    const { content, thread_id } = await request.json();
    console.log(`[DEBUG] 接收到的参数: thread_id=${thread_id}, content长度=${content?.length || 0}`);
    console.log(`[DEBUG] 内容前30个字符: ${content?.substring(0, 30)}...`);

    if (!content || typeof content !== 'string') {
      console.log('[DEBUG] 内容为空或不是字符串类型');
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    console.log('[DEBUG] 开始调用generateDreamPrompt方法');
    // 调用generateDreamPrompt方法获取图片URL
    const result = await generateDreamPrompt(content);
    console.log(`[DEBUG] generateDreamPrompt返回结果: ${result}`);

    if (!result) {
      console.log('[DEBUG] 返回结果为空');
      return NextResponse.json({ error: '生成梦境图片失败: 结果为空' }, { status: 500 });
    }

    // 如果提供了thread_id，则将图片URL存储到数据库
    if (thread_id) {
      try {
        console.log(`[DEBUG] 开始更新数据库，thread_id=${thread_id}, image_url=${result}`);

        // 使用thread_id更新记录
        await updateUserAiChaImage(thread_id, result);
        console.log('[DEBUG] 数据库更新成功');
      } catch (dbError) {
        console.error('[DEBUG] 数据库更新失败:', dbError);
        console.error('[DEBUG] 错误堆栈:', dbError instanceof Error ? dbError.stack : '未知错误');
        // 即使数据库更新失败，我们仍然返回生成的图片URL
      }
    } else {
      console.log('[DEBUG] 未提供thread_id，跳过数据库更新');
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('[DEBUG] 生成梦境图片失败:', error);
    console.error('[DEBUG] 错误堆栈:', error instanceof Error ? error.stack : '未知错误');
    return NextResponse.json({ error: `生成梦境图片失败: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
  }
}
