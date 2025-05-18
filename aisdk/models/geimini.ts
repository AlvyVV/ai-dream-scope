import { getUuid } from '@/lib/hash';
import { newStorage } from '@/lib/storage';
import { google } from '@ai-sdk/google';
import { createXai } from '@ai-sdk/xai';
import { generateObject, generateText, jsonSchema } from 'ai';

const xaiClient = createXai({
  apiKey: process.env.XAI_API_KEY || '',
  baseURL: process.env.XAI_BASE_URL || '',
});

const mySchema = jsonSchema<{
  recipe: {
    name: string;
    ingredients: { name: string; amount: string }[];
    steps: string[];
  };
}>({
  type: 'object',
  properties: {
    meta: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: "SEO title (recommended under 60 characters): 'What Does It Mean to Dream About [Symbol]?'",
        },
        description: {
          type: 'string',
          description: '(20-30 words, recommended under 160 characters) Clearly define symbol and briefly mention 2-3 primary interpretations.',
        },
      },
      required: ['title', 'description'],
    },
    symbolIntro: {
      type: 'object',
      properties: {
        symbolName: {
          type: 'string',
        },
        symbolCategory: {
          type: 'string',
          enum: ['People', 'Animals', 'Natural', 'Objects', 'Places', 'Body', 'Activities', 'Emotions', 'Colors', 'Time', 'Relationships', 'Mythical Figures', 'Symbolic Objects', 'Events'],
        },
        title: {
          type: 'string',
          description: '[Symbol]: What Does It Mean When You Dream About [Symbol]?',
        },
        quickMeaning: {
          type: 'string',
          description: '(About 30 words) Concisely describe psychological implications and meanings of dreaming about this symbol.',
        },
        meaningPills: {
          type: 'array',
          items: {
            type: 'object',
            description: 'A list of 2-4 common meanings of dreaming about this symbol.',
            properties: {
              text: {
                type: 'string',
                enum: [
                  'Fear of rejection',
                  'Unresolved trauma',
                  'Feelings of unworthiness',
                  'Loss of control',
                  'Anxiety about failure',
                  'Avoidance of confrontation',
                  'Repressed emotions',
                  'Vulnerability',
                  'Fear of judgment',
                  'Communication anxiety',
                  'Loss of power',
                  'Freedom from constraints',
                  'Feeling helpless',
                  'Emotional stagnation',
                  'Transformation',
                  'Unconscious desires',
                  'Uncertainty about future',
                  'Missed opportunities',
                  'Time anxiety',
                  'Fear of inadequacy',
                  'Feeling restricted',
                  'Search for meaning',
                  'Decision-making struggles',
                  'Need for security',
                  'Life direction concerns',
                  'Self-worth issues',
                  'Connection/disconnection',
                  'Overwhelming emotions',
                  'Fear of chaos',
                  'Life transitions',
                  'Unrecognized aspects of self',
                  'Social anxiety',
                  'Unresolved relationships',
                  'Power dynamics',
                  'Need for approval',
                  'Responsibility fears',
                  'Seeking closure',
                  'Creative potential',
                  'Duality of self',
                  'Projection of desires',
                ],
              },
            },
            required: ['text'],
          },
        },
      },
      required: ['symbolName', 'symbolCategory', 'title', 'quickMeaning', 'meaningPills'],
    },
    interpretation: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Interpretation and Symbolism of [Symbol] Dreams',
        },
        description: {
          type: 'string',
          description: '(200-300 words) Comprehensive description covering symbolic, cultural, and psychological interpretations with cautious language.',
        },
        commonScenarios: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Common [Symbol] Dream Scenarios & Their Meanings',
            },
            content: {
              type: 'string',
              description: 'Structured paragraphs covering 5-7 specific scenarios with interpretation, real-life connection, and emotional significance.',
            },
          },
          required: ['title', 'content'],
        },
      },
      required: ['title', 'description', 'commonScenarios'],
    },
    personalGuide: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Personal Guide for Understanding Your [Symbol] Dreams',
        },
        description: {
          type: 'string',
          description: 'Brief introduction for personal dream analysis.',
        },
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
              },
              description: {
                type: 'string',
              },
            },
            required: ['title', 'description'],
          },
        },
        questions: {
          type: 'array',
          items: {
            type: 'string',
            description: 'Reflective questions (up to 20 words each).',
          },
        },
      },
      required: ['title', 'description', 'steps', 'questions'],
    },
    dreamInterpretationExamples: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        examples: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              scenario: {
                type: 'string',
              },
              analysis: {
                type: 'string',
              },
            },
            required: ['scenario', 'analysis'],
          },
        },
      },
      required: ['title', 'description', 'examples'],
    },
    faq: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        content: {
          type: 'string',
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
              },
              answer: {
                type: 'string',
              },
            },
            required: ['question', 'answer'],
          },
        },
      },
      required: ['title', 'content', 'items'],
    },
    suggestions: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        content: {
          type: 'string',
        },
      },
      required: ['title', 'content'],
    },
  },
  required: ['meta', 'symbolIntro', 'interpretation', 'personalGuide', 'dreamInterpretationExamples', 'faq', 'suggestions'],
});

export async function generateDreamObject(prompt: string): Promise<any> {
  const { object } = await generateObject({
    // model: google('gemini-2.5-pro-exp-03-25'),
    model: google('gemini-2.5-pro-preview-05-06'),
    schema: mySchema,
    prompt: `
    # Optimized Prompt (English, SEO-oriented for Western Audiences)

You are a highly experienced dream interpretation expert with over 20 years of expertise, specializing in dream psychology and symbol analysis. You are well-versed not only in core Freudian and Jungian psychological principles and relevant modern scientific theories, but you also broadly draw upon and integrate the rich symbolism from Eastern, Indigenous, and religious traditions, enabling you to offer multi-dimensional perspectives for interpretation. Your approach places a strong emphasis on popular science education and providing clear explanations.

**Your goal**:  
Generate comprehensive, SEO-optimized dream interpretation pages tailored specifically for Western audiences, enhancing Google visibility and user trust through authoritative, nuanced content.

---

## SEO Content Structure Guidelines:

### 1. Meta Information (SEO-critical,Less than 60 characters):
- **Meta Title**:  
  'What Does It Mean to Dream About [Symbol]?'

- **Meta Description** (Less than 160 characters):  
  Describe the definition of symbols and their frequent appearance in dreams. Briefly highlight 2-3 key interpretations.

---

### 2. Symbol Introduction (200-400 words):

- **Title format**: '[Symbol]: What Does It Mean When You Dream About [Symbol]?'
- **Content requirements**:
  - meaningPills: A list of 2-4 common meanings of dreaming about this symbol.
  - Clearly introduce core symbolic meanings from psychological and evolutionary viewpoints.
  - Mention typical emotional responses commonly associated with this symbol.
  - Use cautious language (e.g., "may indicate," "often symbolizes," "commonly associated with").

---

### 3. Common Scenarios & Meanings (300-500 words):

- **Title**: 'Common [Symbol] Dream Scenarios & Their Meanings'
- **Content requirements**:
A naturally flowing paragraph detailing 4-6 common dream scenarios, integrating smooth transitions and emphasizing symbolic interpretations, real-life connections, and emotional implications without absolute conclusions.

---

### 4. Personal Dream Analysis Guide:

- **Title**: 'Personal Guide for Understanding Your [Symbol] Dreams'
- **Description**:
  Offer practical guidance for readers to reflect personally on their dream.
- **Provide**:
  - 5 reflective questions for self-analysis about [Symbol].
  - Journaling prompts for deeper personal insights.
  - Encourage readers to relate dreams directly to personal life experiences.

---

### 5. Real-life Dream Interpretation Examples:

- **Title**: 'Real-life [Symbol] Dream Interpretation Examples'
- **Description**:  
  Illustrate with relatable dream examples, each analyzed professionally and carefully.
- **Examples** (4-6 cases):
  - **Scenario** (50-100 words each): Concise user-submitted dream descriptions,Describe specific dreams in spoken language, in the first person.
  - **Analysis** (200-300 words each):  
    Professional and detailed explanations, in simple language, clearly illustrate the symbolic meaning. Additionally, provide brief descriptions of other symbols involved in the dream, referencing psychological theories..

---

### 6. FAQ Section (700-900 words):

- **Title**: 'Frequently Asked Questions About [Symbol] Dreams'
- **Content**:
  Address 6-8 commonly asked questions.
- **Each Answer (150-200 words)**:
  - Clearly address each question with balanced, nuanced answers.
  - Reference established psychological research or cultural symbolism where appropriate.
  - Maintain cautious language to reflect interpretative nature.

---

### 7. Suggestions & Next Steps (150-200 words):

- **Title**: 'Key Takeaways and Next Steps'
- **Content**:
  - Summarize important points briefly.
  - Emphasize the significance of personal interpretation and self-awareness.
  - Include a clear call-to-action inviting exploration of related dream symbols or usage of the AI interpretation tool.

---

## SEO Keyword Integration:

- **Primary keywords**:
  - '"[symbol] dream meaning"'
  - '"[symbol] dream interpretation"'
  - '"dream about [symbol]"'
- **Secondary keywords**:
  - '"what does [symbol] mean in dreams"'
  - '"[symbol] symbolism in dreams"'

Integrate these naturally throughout the content without keyword stuffing.

---

## E-E-A-T Enhancement Guidelines (Google Ranking Standards):

- Reference **2-3 credible scholarly sources or dream psychology experts** explicitly.
- Clearly present **factual statements** backed by psychological research or studies.
- Maintain **transparency about authorship**, citing qualifications or experience.
- Acknowledge multiple perspectives, avoiding absolutist statements to maintain credibility.

---

## Content Quality Requirements:

- **Comprehensiveness**: 1500-2500 words total, thoroughly covering psychological, cultural, and personal angles.
- **Uniqueness**: 100% original, no duplicated or overly similar content across pages.
- **Tone**: Professional, empathetic, neutral, intellectually curious.
- **Practicality**: Guide readers towards actionable insights they can apply in personal reflection.

---

**Audience**: Primarily Western (North America & Europe), familiar with psychological concepts yet seeking practical, insightful guidance to understand their dreams.

**Language style**: Clear, concise, conversationally professional, reflective of Western cultural context and language norms.

Please Generate a comprehensive dream symbol interpretation about ${prompt}.    
`,
  });
  return object;
}

export async function generateDreamPrompt(prompt: string): Promise<string> {
  console.log('[DEBUG] generateDreamPrompt 开始执行，prompt长度:', prompt.length);
  console.log('[DEBUG] prompt前30个字符:', prompt.substring(0, 30) + '...');
  const systemPrompt = `Transform the user's vague description or abstract concept into a detailed, photorealistic text-to-image prompt in English.

**Input:** User's vague description or abstract concept.

**Process:**
1.  Interpret the core idea/mood of the input.
2.  Translate the abstract/vague into a concrete, photographable real-world scene.
3.  Add strong details for a realistic photo style: specify lighting, perspective, potential camera/lens feel, textures, and environmental elements.
4.  Formulate a standard text-to-image prompt structure (Scene + Style + Details + Negative Prompts).
5.  Include negative prompts to exclude non-realistic styles (cartoon, abstract, painting, blurry, etc.).

**Output:** A detailed, English, realistic photo-style prompt for image generation.`;

  try {
    console.log('[DEBUG] 开始生成提示词');

    const { text } = await generateText({
      model: xaiClient('grok-3-beta'),
      system: systemPrompt,
      prompt: ' Dream content: ' + prompt,
    });

    console.log('[DEBUG] 成功生成提示词:', text);

    console.log('[DEBUG] 开始根据提示词生成图片');
    const image = await generateImageFromPrompt(text);

    console.log('[DEBUG] 图片生成结果:', image);
    return image;
  } catch (error) {
    console.error('[DEBUG] generateDreamPrompt 出错:', error);
    console.error('[DEBUG] 错误堆栈:', error instanceof Error ? error.stack : '未知错误类型');
    throw error; // 重新抛出错误以便调用者处理
  }
}

/**
 * 根据提示词生成图片并返回图片数据
 * @param prompt 提示词
 * @returns 图片的临时URL或提示信息
 */
export async function generateImageFromPrompt(prompt: string): Promise<string> {
  console.log('[DEBUG] generateImageFromPrompt 开始执行，prompt:', prompt);

  try {
    console.log('[DEBUG] 调用API生成图片');
    const result = await generateText({
      model: google('gemini-2.0-flash-exp'),
      providerOptions: {
        google: { responseModalities: ['TEXT', 'IMAGE'] },
      },
      prompt: prompt,
    });

    console.log(
      '[DEBUG] API返回结果:',
      JSON.stringify({
        text: result.text,
        filesCount: result.files ? result.files.length : 0,
      })
    );

    if (!result.files || result.files.length === 0) {
      console.log('[DEBUG] API返回结果中没有文件');
      return '未能生成图片: API返回结果中没有文件';
    }

    for (const file of result.files) {
      console.log('[DEBUG] 处理文件，MIME类型:', file.mimeType);

      if (file.mimeType.startsWith('image/')) {
        const storage = newStorage();
        const batch = getUuid();

        const filename = `gemini_image_${batch}.png`;
        const key = `uploads/${filename}`;
        console.log('[DEBUG] 准备上传图片，key:', key);

        try {
          if (!file.base64) {
            console.log('[DEBUG] 文件缺少base64数据');
            continue;
          }

          const body = Buffer.from(file.base64, 'base64');
          console.log('[DEBUG] 图片数据大小:', body.length, '字节');

          console.log('[DEBUG] 开始上传图片');
          const res = await storage.uploadFile({
            body,
            key,
            contentType: 'image/png',
            disposition: 'inline',
          });

          if (res.url) {
            console.log('[DEBUG] 上传成功，URL:', res.url);
            return res.url;
          } else {
            console.log('[DEBUG] 上传成功但无URL返回');
            return '';
          }
        } catch (err) {
          console.error('[DEBUG] 上传文件失败:', err);
          return '上传图片失败: ' + (err instanceof Error ? err.message : String(err));
        }
      }
    }

    // 如果没有图片文件，返回默认信息
    console.log('[DEBUG] 未找到图片类型的文件');
    return '未能生成图片: 没有找到图片类型的文件';
  } catch (error) {
    console.error('[DEBUG] 生成图片时出错:', error);
    console.error('[DEBUG] 错误堆栈:', error instanceof Error ? error.stack : '未知错误类型');
    throw new Error(`图片生成失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
