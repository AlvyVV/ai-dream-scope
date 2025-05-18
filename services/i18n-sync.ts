import { locales } from '@/i18n/locale';
import { findPreviousVersionPageConfig, insertPageConfig } from '@/models/page-config';
import { compareObjects } from '@/services/object-manager';
import { translateToMultipleLanguages } from '@/services/object-translator';
import { PageConfig } from '@/types/page-config';

/**
 * 同步页面配置的多语言版本
 * @param pageConfig 原始页面配置
 * @returns 同步结果，包含成功和失败的语言列表
 */
export async function syncPageConfigI18n(pageConfig: PageConfig) {
  const result = {
    success: [] as string[],
    failed: [] as { locale: string; error: string }[],
  };

  try {
    console.log(`开始同步页面配置 ${pageConfig.code} 的多语言版本`);
    console.log(
      `原始页面配置:`,
      JSON.stringify(
        {
          id: pageConfig.id,
          code: pageConfig.code,
          locale: pageConfig.locale,
          content_keys: Object.keys(pageConfig.content || {}),
          meta_keys: Object.keys(pageConfig.meta || {}),
        },
        null,
        2
      )
    );

    // 获取需要翻译的内容
    const { content, meta } = await getTranslationContent(pageConfig);

    console.log(`[调试] 需要翻译的内容:`, {
      content_put_size: Object.keys(content.put).length,
      meta_put_size: Object.keys(meta.put).length,
      content_del_size: content.del.length,
      meta_del_size: meta.del.length,
      content_put_sample: JSON.stringify(content.put).substring(0, 200) + '...',
      meta_put_sample: JSON.stringify(meta.put).substring(0, 200) + '...',
      content_del: content.del,
      meta_del: meta.del,
    });

    if (Object.keys(content.put).length === 0 && Object.keys(meta.put).length === 0) {
      console.warn(`[警告] 没有检测到需要翻译的内容，可能导致翻译结果与原始内容相同`);
    }

    // 排除当前语言
    const targetLocales = locales.filter(locale => locale !== pageConfig.locale);

    if (targetLocales.length === 0) {
      console.warn('没有需要翻译的目标语言');
      return result;
    }

    console.log(`目标语言: ${targetLocales.join(', ')}`);

    try {
      // 翻译 content
      const contentToTranslate = JSON.stringify(content.put);
      console.log(`准备翻译content (${contentToTranslate.length} 字符):`);
      console.log(`[调试] 翻译前content原文: ${contentToTranslate.substring(0, 300)}...`);

      // 添加对内容长度的检查
      if (contentToTranslate.length > 5000) {
        console.warn(`[分块] Content长度超过限制，将使用分块翻译策略`);
      }

      const translatedContents = await translateToMultipleLanguages(targetLocales, contentToTranslate);

      // 确保 translatedContents 是数组类型
      const translatedContentsArray = Array.isArray(translatedContents) ? translatedContents : [];

      console.log(
        `[调试] 翻译后content结果:`,
        translatedContentsArray.map((t: { locale: string; text: string }) => ({
          locale: t.locale,
          text_length: t.text.length,
          text_sample: t.text.substring(0, 100) + '...',
          is_different: t.text !== contentToTranslate,
        }))
      );

      // 翻译 meta
      const metaToTranslate = JSON.stringify(meta.put);
      console.log(`准备翻译meta (${metaToTranslate.length} 字符):`);
      console.log(`[调试] 翻译前meta原文: ${metaToTranslate.substring(0, 300)}...`);

      // 添加对meta长度的检查
      if (metaToTranslate.length > 5000) {
        console.warn(`[分块] Meta长度超过限制，将使用分块翻译策略`);
      }

      const translatedMetas = await translateToMultipleLanguages(targetLocales, metaToTranslate);

      // 确保 translatedMetas 是数组类型
      const translatedMetasArray = Array.isArray(translatedMetas) ? translatedMetas : [];

      console.log(
        `[调试] 翻译后meta结果:`,
        translatedMetasArray.map((t: { locale: string; text: string }) => ({
          locale: t.locale,
          text_length: t.text.length,
          text_sample: t.text.substring(0, 100) + '...',
          is_different: t.text !== metaToTranslate,
        }))
      );

      // 处理翻译结果并写入数据库
      for (const locale of targetLocales) {
        try {
          // 查找对应语言的翻译结果
          const translatedContent = translatedContentsArray.find((t: { locale: string; text: string }) => t.locale === locale)?.text || contentToTranslate;
          const translatedMeta = translatedMetasArray.find((t: { locale: string; text: string }) => t.locale === locale)?.text || metaToTranslate;

          console.log(`[调试] ${locale}语言的翻译结果:`, {
            content_different: translatedContent !== contentToTranslate,
            meta_different: translatedMeta !== metaToTranslate,
            content_sample: translatedContent.substring(0, 100) + '...',
            meta_sample: translatedMeta.substring(0, 100) + '...',
          });

          // 解析JSON
          let parsedContentChanges: Record<string, any>;
          let parsedMetaChanges: Record<string, any>;

          try {
            parsedContentChanges = JSON.parse(translatedContent);
            console.log(`[调试] ${locale}语言content解析成功，键数量:`, Object.keys(parsedContentChanges).length);
          } catch (error) {
            console.error(`解析${locale}语言的content失败:`, error);
            console.log(`[调试] 解析失败的内容:`, translatedContent.substring(0, 200));
            parsedContentChanges = content.put; // 解析失败时使用原内容
            console.warn(`[警告] 使用原始content作为备用`);
          }

          try {
            parsedMetaChanges = JSON.parse(translatedMeta);
            console.log(`[调试] ${locale}语言meta解析成功，键数量:`, Object.keys(parsedMetaChanges).length);
          } catch (error) {
            console.error(`解析${locale}语言的meta失败:`, error);
            console.log(`[调试] 解析失败的内容:`, translatedMeta.substring(0, 200));
            parsedMetaChanges = meta.put; // 解析失败时使用原内容
            console.warn(`[警告] 使用原始meta作为备用`);
          }

          // 查找目标语言的现有配置，以便进行更新
          const existingTargetConfig = await findPreviousVersionPageConfig(pageConfig.code, locale, pageConfig.version);

          // 准备内容和元数据
          let finalContent: Record<string, any> = {};
          let finalMeta: Record<string, any> = {};

          if (existingTargetConfig) {
            console.log(`找到${locale}语言的现有配置，ID: ${existingTargetConfig.id}, 版本: ${existingTargetConfig.version}`);

            // 复制现有配置
            finalContent = { ...((existingTargetConfig.content as Record<string, any>) || {}) };
            finalMeta = { ...((existingTargetConfig.meta as Record<string, any>) || {}) };

            // 应用翻译后的更改
            for (const key in parsedContentChanges) {
              finalContent[key] = parsedContentChanges[key];
            }

            for (const key in parsedMetaChanges) {
              finalMeta[key] = parsedMetaChanges[key];
            }

            // 删除需要删除的字段
            for (const path of content.del) {
              if (path.includes('.')) {
                // 处理嵌套路径的删除
                const parts = path.split('.');
                let obj: Record<string, any> = finalContent;
                for (let i = 0; i < parts.length - 1; i++) {
                  if (obj[parts[i]] && typeof obj[parts[i]] === 'object') {
                    obj = obj[parts[i]] as Record<string, any>;
                  } else {
                    break;
                  }
                }
                if (obj && typeof obj === 'object') {
                  delete obj[parts[parts.length - 1]];
                }
              } else {
                // 处理顶级字段的删除
                delete finalContent[path];
              }
            }

            for (const path of meta.del) {
              if (path.includes('.')) {
                // 处理嵌套路径的删除
                const parts = path.split('.');
                let obj: Record<string, any> = finalMeta;
                for (let i = 0; i < parts.length - 1; i++) {
                  if (obj[parts[i]] && typeof obj[parts[i]] === 'object') {
                    obj = obj[parts[i]] as Record<string, any>;
                  } else {
                    break;
                  }
                }
                if (obj && typeof obj === 'object') {
                  delete obj[parts[parts.length - 1]];
                }
              } else {
                // 处理顶级字段的删除
                delete finalMeta[path];
              }
            }
          } else {
            console.log(`未找到${locale}语言的现有配置，将使用翻译结果作为完整内容`);
            // 如果没有现有配置，使用翻译后的内容作为完整内容
            finalContent = parsedContentChanges;
            finalMeta = parsedMetaChanges;
          }

          // 检查翻译结果是否与原始内容不同
          const contentDifferent = JSON.stringify(parsedContentChanges) !== JSON.stringify(content.put);
          const metaDifferent = JSON.stringify(parsedMetaChanges) !== JSON.stringify(meta.put);

          if (!contentDifferent && !metaDifferent) {
            console.warn(`[警告] ${locale}语言的翻译结果与原始内容完全相同，可能翻译失败`);
          }

          // 准备新的页面配置
          const newPageConfig: Partial<PageConfig> = {
            project_id: pageConfig.project_id,
            code: pageConfig.code,
            content: finalContent,
            meta: finalMeta,
            locale: locale,
            status: pageConfig.status,
            version: pageConfig.version || 1,
          };

          console.log(`[调试] 准备写入${locale}语言版本数据:`, {
            project_id: newPageConfig.project_id,
            code: newPageConfig.code,
            locale: newPageConfig.locale,
            status: newPageConfig.status,
            version: newPageConfig.version,
            content_keys: Object.keys(finalContent),
            meta_keys: Object.keys(finalMeta),
            content_values: Object.values(finalContent).map(v => (typeof v === 'string' ? v.substring(0, 30) : JSON.stringify(v).substring(0, 30))),
            meta_values: Object.values(finalMeta).map(v => (typeof v === 'string' ? v.substring(0, 30) : JSON.stringify(v).substring(0, 30))),
          });

          // 写入数据库
          console.log(`准备将${locale}语言版本写入数据库`);
          const insertedData = await insertPageConfig(newPageConfig);

          if (insertedData) {
            console.log(`${locale}语言版本同步成功，ID: ${insertedData[0]?.id}`);
            result.success.push(locale);
          } else {
            throw new Error('数据库插入失败');
          }
        } catch (error: any) {
          console.error(`${locale}语言版本同步失败:`, error);
          result.failed.push({
            locale,
            error: error.message || '未知错误',
          });
        }
      }
    } catch (translationError: any) {
      console.error('翻译过程中发生错误:', translationError);
      throw new Error(`翻译失败: ${translationError.message || '未知错误'}`);
    }

    console.log(`页面配置 ${pageConfig.code} 的多语言同步完成`);
  } catch (error: any) {
    console.error('多语言同步过程中发生错误:', error);
    throw new Error(`多语言同步失败: ${error.message}`);
  }

  return result;
}

/**
 * 获取需要翻译的内容
 * @param pageConfig 当前页面配置
 * @returns 需要翻译的content和meta对象，包含put和del
 */
async function getTranslationContent(pageConfig: PageConfig): Promise<{
  content: { put: Record<string, any>; del: string[] };
  meta: { put: Record<string, any>; del: string[] };
}> {
  try {
    // 查找最大版本的相同code和locale的记录
    const existingConfig = await findPreviousVersionPageConfig(pageConfig.code, pageConfig.locale, pageConfig.version);

    console.log(`[调试] 当前配置:`, {
      id: pageConfig.id,
      code: pageConfig.code,
      locale: pageConfig.locale,
      version: pageConfig.version,
    });

    // 如果存在记录且不是当前记录，计算变更部分
    if (existingConfig && existingConfig.id !== pageConfig.id) {
      console.log(`找到已存在的配置，ID: ${existingConfig.id}, 版本: ${existingConfig.version}`);
      console.log(`[调试] 已存在配置内容:`, {
        content_keys: Object.keys(existingConfig.content || {}),
        meta_keys: Object.keys(existingConfig.meta || {}),
      });
      console.log(`[调试] 当前配置内容:`, {
        content_keys: Object.keys(pageConfig.content || {}),
        meta_keys: Object.keys(pageConfig.meta || {}),
      });

      // 比较变更
      const contentChanges = compareObjects(existingConfig.content || {}, pageConfig.content || {});
      const metaChanges = compareObjects(existingConfig.meta || {}, pageConfig.meta || {});

      console.log('[调试] content变更:', JSON.stringify(contentChanges));
      console.log('[调试] meta变更:', JSON.stringify(metaChanges));

      // 检查变更部分是否为空
      if (Object.keys(contentChanges.put).length === 0 && Object.keys(metaChanges.put).length === 0) {
        console.warn(`[警告] 没有检测到内容变更，将返回完整对象进行翻译`);
        return {
          content: {
            put: pageConfig.content || {},
            del: [],
          },
          meta: {
            put: pageConfig.meta || {},
            del: [],
          },
        };
      }

      // 返回变更部分
      return {
        content: contentChanges,
        meta: metaChanges,
      };
    }

    // 如果没有记录或是同一条记录，返回完整对象
    console.log('未找到已存在的配置或是同一条记录，将翻译整个对象');
    return {
      content: {
        put: pageConfig.content || {},
        del: [],
      },
      meta: {
        put: pageConfig.meta || {},
        del: [],
      },
    };
  } catch (error) {
    console.error('获取翻译内容时出错:', error);
    // 出错时返回完整对象
    return {
      content: {
        put: pageConfig.content || {},
        del: [],
      },
      meta: {
        put: pageConfig.meta || {},
        del: [],
      },
    };
  }
}
