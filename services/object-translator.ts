// 创建一个方法，输入参数是语言的字符串列表,返回结果是{local:string,text:string}的列表
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// 初始化 Google Generative AI
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// 定义翻译分块大小（字符数）
const MAX_CHUNK_SIZE = 3000; // 根据API限制可调整
const MAX_TOTAL_SIZE = 30000; // 设置一个安全的总大小上限

/**
 * 定义翻译结果的schema
 */
const translationSchema = {
  description: 'Translation result',
  type: SchemaType.OBJECT,
  properties: {
    locale: {
      type: SchemaType.STRING,
      description: "Language code (e.g., 'en', 'zh', 'fr')",
      nullable: false,
    },
    text: {
      type: SchemaType.STRING,
      description: 'Translated json in the specified language',
      nullable: false,
    },
  },
  required: ['locale', 'text'],
};

/**
 * 翻译文本到多种语言（逐个查询）
 * @param languages 语言代码列表，例如 ['en', 'zh', 'fr']
 * @param text 要翻译的原文
 * @returns 包含各语言翻译结果的数组 [{locale: string, text: string}]
 */
export async function translateToMultipleLanguages(languages: string[], text: string) {
  const results = [];

  console.log(`[翻译器] 开始翻译到多种语言: ${languages.join(', ')}`);
  console.log(`[翻译器] 原文长度: ${text.length} 字符`);

  // 检查总文本长度是否超出安全限制
  if (text.length > MAX_TOTAL_SIZE) {
    console.warn(`[警告] 翻译内容超过最大安全限制(${MAX_TOTAL_SIZE}字符)，可能导致部分内容未被翻译`);
    text = text.substring(0, MAX_TOTAL_SIZE);
    console.log(`[翻译器] 截断后的原文长度: ${text.length} 字符`);
  }

  if (!text || (typeof text === 'object' && Object.keys(text).length === 0) || (Array.isArray(text) && text.length === 0)) {
    console.warn('[翻译器] 翻译内容为空或只是空对象/数组，跳过翻译');
    return text;
  }

  // 检查原文是否是有效的JSON
  let isValidJson = false;
  let jsonObj = null;
  try {
    jsonObj = JSON.parse(text);
    isValidJson = true;
    console.log('[翻译器] 原文是有效的JSON');
  } catch (e) {
    console.warn('[翻译器] 原文不是有效的JSON格式，这可能会影响翻译结果');
  }

  // 如果是大型JSON且有效，尝试使用JSON分块翻译
  const shouldUseChunking = isValidJson && text.length > MAX_CHUNK_SIZE && typeof jsonObj === 'object';

  // 逐个翻译每种语言
  for (const locale of languages) {
    try {
      console.log(`[翻译器] 开始翻译到 ${locale} 语言`);

      let translatedText = '';

      // 使用JSON分块翻译
      if (shouldUseChunking) {
        console.log(`[翻译器] 文本长度(${text.length})超过单次翻译限制(${MAX_CHUNK_SIZE})，将使用分块翻译`);
        translatedText = await translateJsonByChunks(locale, jsonObj);
      } else {
        // 常规翻译
        translatedText = await translateText(locale, text, isValidJson);
      }

      console.log(`[翻译器] ${locale} 翻译完成，结果长度: ${translatedText.length} 字符`);
      console.log(`[翻译器] ${locale} 翻译结果与原文是否相同: ${translatedText === text}`);

      if (translatedText === text) {
        console.warn(`[翻译器] 对于 ${locale} 将使用原文或错误标记`);
      }

      results.push({
        locale,
        text: translatedText,
      });
    } catch (error) {
      console.error(`[翻译器] ${locale} 翻译错误:`, error);
      results.push({
        locale,
        text: locale === 'en' ? text : `[Translation error for ${locale}]`,
      });
      console.warn(`[翻译器] 对于 ${locale} 将使用原文或错误标记`);
    }
  }

  return results;
}

/**
 * 分块翻译JSON对象
 * @param targetLanguage 目标语言代码
 * @param jsonObj 要翻译的JSON对象
 * @returns 翻译后的JSON字符串
 */
async function translateJsonByChunks(targetLanguage: string, jsonObj: any): Promise<string> {
  console.log(`[翻译器] 开始JSON分块翻译，目标语言: ${targetLanguage}`);

  try {
    // 根据对象类型处理
    if (Array.isArray(jsonObj)) {
      return await translateJsonArray(targetLanguage, jsonObj);
    } else {
      return await translateJsonObject(targetLanguage, jsonObj);
    }
  } catch (error) {
    console.error(`[翻译器] JSON分块翻译错误:`, error);
    // 翻译失败时返回原JSON
    return JSON.stringify(jsonObj);
  }
}

/**
 * 翻译JSON数组
 * @param targetLanguage 目标语言代码
 * @param jsonArray 要翻译的JSON数组
 * @returns 翻译后的JSON字符串
 */
async function translateJsonArray(targetLanguage: string, jsonArray: any[]): Promise<string> {
  console.log(`[翻译器] 翻译JSON数组，元素数量: ${jsonArray.length}`);

  // 对于大型数组，分块处理
  const chunkSize = 10; // 每次处理的数组元素数量
  const translatedArray = [];

  // 分批处理数组元素
  for (let i = 0; i < jsonArray.length; i += chunkSize) {
    const chunk = jsonArray.slice(i, i + chunkSize);
    console.log(`[翻译器] 处理数组分块 ${i}-${i + chunk.length - 1}/${jsonArray.length}`);

    // 处理当前批次
    const chunkPromises = chunk.map(async (item, index) => {
      try {
        if (typeof item === 'object' && item !== null) {
          // 递归翻译嵌套对象
          if (Array.isArray(item)) {
            return JSON.parse(await translateJsonArray(targetLanguage, item));
          } else {
            return JSON.parse(await translateJsonObject(targetLanguage, item));
          }
        } else if (typeof item === 'string' && item.length > 0) {
          // 翻译字符串值
          const translated = await translateText(targetLanguage, item, false);
          return translated;
        } else {
          // 其他类型不翻译
          return item;
        }
      } catch (error) {
        console.error(`[翻译器] 数组元素 ${i + index} 翻译失败:`, error);
        return item; // 翻译失败返回原值
      }
    });

    // 等待当前批次完成
    const translatedChunk = await Promise.all(chunkPromises);
    translatedArray.push(...translatedChunk);
  }

  return JSON.stringify(translatedArray);
}

/**
 * 翻译JSON对象
 * @param targetLanguage 目标语言代码
 * @param jsonObj 要翻译的JSON对象
 * @returns 翻译后的JSON字符串
 */
async function translateJsonObject(targetLanguage: string, jsonObj: Record<string, any>): Promise<string> {
  console.log(`[翻译器] 翻译JSON对象，属性数量: ${Object.keys(jsonObj).length}`);

  // 创建结果对象
  const result: Record<string, any> = {};

  // 按属性分组，每组不超过最大块大小
  const keys = Object.keys(jsonObj);
  const keyGroups: string[][] = [];
  let currentGroup: string[] = [];
  let currentSize = 0;

  // 分组键
  for (const key of keys) {
    const value = jsonObj[key];
    const valueSize = typeof value === 'string' ? value.length : JSON.stringify(value).length;

    // 如果单个值已经超过限制，需要单独处理
    if (valueSize > MAX_CHUNK_SIZE) {
      if (currentGroup.length > 0) {
        keyGroups.push([...currentGroup]);
        currentGroup = [];
        currentSize = 0;
      }
      keyGroups.push([key]); // 单独一组
    }
    // 如果当前组加上新值会超出限制，创建新组
    else if (currentSize + valueSize > MAX_CHUNK_SIZE && currentGroup.length > 0) {
      keyGroups.push([...currentGroup]);
      currentGroup = [key];
      currentSize = valueSize;
    }
    // 否则加入当前组
    else {
      currentGroup.push(key);
      currentSize += valueSize;
    }
  }

  // 确保最后一组被添加
  if (currentGroup.length > 0) {
    keyGroups.push(currentGroup);
  }

  console.log(`[翻译器] JSON对象分成 ${keyGroups.length} 个组进行翻译`);

  // 处理每个组
  for (let i = 0; i < keyGroups.length; i++) {
    const group = keyGroups[i];
    console.log(`[翻译器] 处理组 ${i + 1}/${keyGroups.length}, 包含 ${group.length} 个键`);

    // 创建包含当前组属性的子对象
    const subObject: Record<string, any> = {};
    for (const key of group) {
      subObject[key] = jsonObj[key];
    }

    try {
      // 如果只有一个键且值是复杂对象，递归处理
      if (group.length === 1 && typeof subObject[group[0]] === 'object' && subObject[group[0]] !== null) {
        const key = group[0];
        const value = subObject[key];

        if (Array.isArray(value)) {
          result[key] = JSON.parse(await translateJsonArray(targetLanguage, value));
        } else {
          result[key] = JSON.parse(await translateJsonObject(targetLanguage, value));
        }
      }
      // 否则翻译整个子对象
      else {
        const subObjectJson = JSON.stringify(subObject);
        const translatedJson = await translateText(targetLanguage, subObjectJson, true);

        try {
          // 解析翻译结果并合并到主结果
          const translatedObj = JSON.parse(translatedJson);
          for (const key of group) {
            if (key in translatedObj) {
              result[key] = translatedObj[key];
            } else {
              console.warn(`[翻译器] 翻译结果中缺少键: ${key}，将使用原值`);
              result[key] = jsonObj[key];
            }
          }
        } catch (parseError) {
          console.error(`[翻译器] 无法解析翻译后的JSON:`, parseError);
          // 解析失败时使用原值
          for (const key of group) {
            result[key] = jsonObj[key];
          }
        }
      }
    } catch (error) {
      console.error(`[翻译器] 组 ${i + 1} 翻译失败:`, error);
      // 翻译失败时使用原值
      for (const key of group) {
        result[key] = jsonObj[key];
      }
    }
  }

  return JSON.stringify(result);
}

/**
 * 翻译单个文本到指定语言
 * @param targetLanguage 目标语言代码，例如 'zh'
 * @param text 要翻译的原文
 * @param isJson 是否为JSON格式文本
 * @returns 翻译后的文本
 */
export async function translateText(targetLanguage: string, text: string, isJson: boolean = false) {
  try {
    // 检查文本长度，如果超过限制，返回警告并返回原文
    if (text.length > MAX_CHUNK_SIZE) {
      console.warn(`[翻译器] 文本长度(${text.length})超过单次翻译限制(${MAX_CHUNK_SIZE})，无法直接翻译`);
      return text;
    }

    // 如果原文只包含ASCII字符且目标不是英文，那可能需要翻译
    const needsTranslation = targetLanguage !== 'en' || !text.match(/^[\x00-\x7F]*$/);
    if (!needsTranslation) {
      console.log('[翻译器] 原文只包含ASCII字符且目标是英文，无需翻译');
      return text;
    }

    // 创建 gemini-2.0-flash 模型实例
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: translationSchema as any,
      },
    });

    // 构建提示词，替换目标语言
    const prompt = isJson
      ? `
        You are a JSON translation expert. Your task is to translate the JSON content enclosed with <translate_input> from its source language to ${targetLanguage}.
        
        Important rules:
        1. Maintain the exact JSON structure with all keys unchanged
        2. Only translate the string values, not the keys
        3. Do not add or remove any JSON properties
        4. Ensure the output is valid JSON
        5. Keep numbers, booleans, nulls, and other non-string values unchanged
        6. Preserve all formatting and special characters in strings
        
        <translate_input>
        ${text}
        </translate_input>

        If the input is in JSON format, the output JSON format must not change, only the value content of the JSON is translated.
        Return the translated JSON as a valid JSON string that can be parsed with JSON.parse().
        Do not include any explanations or context - ONLY return the translated JSON.
      `
      : `
        You are a translation expert. Your task is to translate the text enclosed with <translate_input> from its source language to ${targetLanguage}.
        
        <translate_input>
        ${text}
        </translate_input>
        
        Return only the translated text without any explanations, formatting, or markers.
        Keep the original formatting, including line breaks, spacing, and punctuation.
      `;

    console.log(`[翻译器] 发送到Google API的提示词长度: ${prompt}`);

    // 生成翻译
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log(`[翻译器] Google API响应长度: ${responseText.length}`);

    try {
      // 尝试解析JSON响应
      console.log(`[翻译器] 尝试解析API响应为JSON`);
      const translation = JSON.parse(responseText);

      if (translation.text) {
        console.log(`[翻译器] 解析成功，返回translation.text`, translation.text);
        return translation.text;
      } else {
        console.warn(`[翻译器] 无法找到translation.text，使用整个responseText`);
        return responseText.trim();
      }
    } catch (parseError) {
      // 如果返回的不是JSON格式，直接使用文本响应
      console.log(`[翻译器] 响应不是有效的JSON格式，直接使用原始响应文本`);
      return responseText.trim();
    }
  } catch (error) {
    console.error('[翻译器] 翻译过程中出错:', error);
    return text; // 发生错误时返回原文
  }
}
