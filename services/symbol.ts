import { generateDreamObject } from '@/aisdk/models/geimini';
import { SymbolInterpretation } from '@/types/pages/interpretation';
import OpenAI from 'openai';

// 创建 OpenAI 实例
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * 使用Genmini解析符号意义
 * @param symbol 需要解析的符号
 * @returns 符号解析结果
 */
export async function interpretSymbolByGenmini(symbol: string): Promise<SymbolInterpretation> {
  try {
    console.log('开始使用Gemini解析符号:', symbol);

    const interpretation = await generateDreamObject(symbol);

    if (!interpretation) {
      throw new Error('Gemini API返回内容为空');
    }

    // 限制meaningPills数组长度，随机保留3个或4个元素
    if (interpretation.symbolIntro?.meaningPills && interpretation.symbolIntro.meaningPills.length > 4) {
      // 随机决定保留3个或4个元素
      const limit = Math.random() < 0.5 ? 3 : 4;
      console.log(`随机决定保留${limit}个meaningPills元素`);
      interpretation.symbolIntro.meaningPills = interpretation.symbolIntro.meaningPills.slice(0, limit);
    }

    console.log('Gemini API解析符号成功');
    return interpretation;
  } catch (error) {
    console.error('使用Gemini解析符号时出错:', error);
    throw new Error(`使用Gemini解析符号失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 使用OpenAI解析符号意义
 * @param symbol 需要解析的符号
 * @returns 符号解析结果
 */
export async function interpretSymbol(symbol: string): Promise<SymbolInterpretation> {
  try {
    console.log('开始解析符号:', symbol);

    const input: {
      threadId: string | null;
      message: string;
    } = { threadId: null, message: symbol };

    // Create a thread if needed
    const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;

    // Add a message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: input.message,
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID || '',
    });

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      // 解析返回的JSON
      const content = messages.data[0].content;
      console.log('API返回内容:', content);

      if (!content || content.length === 0) {
        throw new Error('API返回内容为空');
      }

      // 确保content[0]有text属性
      if (content[0].type !== 'text') {
        throw new Error('API返回内容格式不正确');
      }

      // 解析JSON
      const textContent = content[0].text.value;
      console.log('解析前的文本内容:', textContent);

      const interpretation: SymbolInterpretation = JSON.parse(textContent);
      return interpretation;
    } else {
      throw new Error(`OpenAI处理失败，状态: ${run.status}`);
    }
  } catch (error) {
    console.error('解析符号时出错:', error);
    throw new Error(`解析符号失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 客户端API - 解析符号
 * 这个函数用于在客户端调用服务器API
 * @param symbol 需要解析的符号
 * @returns 符号解析结果
 */
export async function interpretSymbolClient(symbol: string): Promise<SymbolInterpretation> {
  try {
    const response = await fetch('/api/symbols/interpret', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '符号解析失败');
    }

    const data = await response.json();
    return data as SymbolInterpretation;
  } catch (error) {
    console.error('解析符号时出错:', error);
    throw new Error(`解析符号失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
