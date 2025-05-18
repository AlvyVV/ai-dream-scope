import { translateToMultipleLanguages } from '@/services/object-translator';
import { NextRequest, NextResponse } from 'next/server';


export const runtime = "edge";

/**
 * 测试翻译服务的API
 */
export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const body = await req.json();
    const { text, locales = ['en', 'zh'] } = body;

    if (!text) {
      return NextResponse.json({ error: '缺少必要参数：text' }, { status: 400 });
    }

    console.log(`开始测试翻译服务，输入内容: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
    console.log(`目标语言: ${locales.join(', ')}`);

    // 执行翻译
    const results = await translateToMultipleLanguages(locales, text);

    // 检查翻译结果是否与原文相同

    // 返回结果
    return NextResponse.json({
      success: true,
      message: '翻译测试完成',
      results,
      unchanged: '',
    });
  } catch (error: any) {
    console.error('翻译测试API错误:', error);

    return NextResponse.json({ error: `翻译测试失败: ${error.message || '未知错误'}` }, { status: 500 });
  }
}

/**
 * 获取翻译服务状态
 */
export async function GET(req: NextRequest) {
  // 验证环境变量
  const apiKey = process.env.GOOGLE_API_KEY;

  return NextResponse.json({
    status: 'ready',
    apiKeyConfigured: !!apiKey,
    message: apiKey ? 'Google API 密钥已配置，翻译服务准备就绪' : '警告: Google API 密钥未配置，翻译服务将无法正常工作',
  });
}
