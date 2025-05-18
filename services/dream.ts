import { SymbolInterpretation } from '@/types/pages/interpretation';
import OpenAI from 'openai';

// 创建 OpenAI 实例
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * 使用OpenAI解析符号意义
 * @param symbol 需要解析的符号
 * @returns 符号解析结果
 */
export async function interpretSymbol(dreamContent: string): Promise<SymbolInterpretation> {
  try {
    const input: {
      threadId: string | null;
      message: string;
    } = { threadId: null, message: dreamContent };

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

export interface DreamInterpretationRequest {
  dream: string;
  locale: string;
}

export interface DreamInterpretationResponse {
  interpretation: string;
  symbols: string[];
  emotions: string[];
  advice: string;
}

export async function interpretDream({ dream, locale }: DreamInterpretationRequest): Promise<DreamInterpretationResponse> {
  const prompt = `作为一个专业的梦境解析师，请分析以下梦境并提供详细的解析：
梦境内容：${dream}

请从以下几个方面进行分析：
1. 整体解析
2. 主要象征符号
3. 情感分析
4. 建议

请用${locale === 'zh' ? '中文' : '英文'}回答。`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的梦境解析师，擅长分析梦境中的象征意义和深层含义。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const response = completion.choices[0].message.content;

  // 解析响应内容
  const sections = response?.split('\n\n') || [];

  return {
    interpretation: sections[0] || '',
    symbols: sections[1]?.split('\n').filter(Boolean) || [],
    emotions: sections[2]?.split('\n').filter(Boolean) || [],
    advice: sections[3] || '',
  };
}
