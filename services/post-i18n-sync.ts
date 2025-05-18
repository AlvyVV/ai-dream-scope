import { locales } from '@/i18n/locale';
import { getUuid } from '@/lib/hash';
import { findBlogByUuidAndLocale, insertBlog } from '@/models/blog';
import { translateToMultipleLanguages } from '@/services/object-translator';
import { Blog } from '@/types/blog';

/**
 * 同步文章的多语言版本
 * @param blog 原始文章
 * @returns 同步结果，包含成功和失败的语言列表
 */
export async function syncBlogI18n(blog: Blog) {
  const result = {
    success: [] as string[],
    failed: [] as { locale: string; error: string }[],
  };

  try {
    console.log(`开始同步文章 ${blog.title} 的多语言版本`);

    // 排除当前语言
    const targetLocales = locales.filter(locale => locale !== blog.locale);

    if (targetLocales.length === 0) {
      console.log('没有需要翻译的目标语言');
      return result;
    }

    console.log(`目标语言: ${targetLocales.join(', ')}`);

    try {
      // 需要翻译的字段
      const fieldsToTranslate = {
        title: blog.title || '',
        description: blog.description || '',
        content: blog.content || '',
        meta: {
          title: blog.meta?.title || '',
          description: blog.meta?.description || '',
        },
      };

      // 翻译标题和描述
      const translatedFields = await translateToMultipleLanguages(targetLocales, JSON.stringify(fieldsToTranslate));

      // 处理每种语言
      // 确保 translatedFields 是数组类型
      const translatedFieldsArray = Array.isArray(translatedFields) ? translatedFields : [];

      for (const { locale, text } of translatedFieldsArray) {
        try {
          console.log(`开始处理 ${locale} 语言版本`);

          // 解析翻译结果
          let parsedFields;
          try {
            parsedFields = JSON.parse(text);
          } catch (error) {
            throw new Error(`无法解析翻译结果: ${error instanceof Error ? error.message : '未知错误'}`);
          }

          // 检查是否已存在该语言的文章
          const existingBlog = await findBlogByUuidAndLocale(blog.uuid || '', locale);

          if (existingBlog) {
            console.log(`找到${locale}语言的现有文章，UUID: ${existingBlog.uuid}`);
          }

          // 准备新的文章数据
          const newBlog: Partial<Blog> = {
            project_id: blog.project_id,
            uuid: existingBlog?.uuid || getUuid(),
            slug: blog.slug,
            title: parsedFields.title,
            description: parsedFields.description,
            content: parsedFields.content,
            meta: {
              title: parsedFields.meta_title,
              description: parsedFields.meta_description,
            },
            locale: locale,
            status: blog.status,
            cover_url: blog.cover_url,
            author_name: blog.author_name,
            author_avatar_url: blog.author_avatar_url,
          };

          console.log(`准备将${locale}语言版本写入数据库`);
          const insertedData = await insertBlog(newBlog);
          console.log('insertedData', insertedData);
          if (insertedData) {
            console.log(`${locale}语言版本同步成功`);
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

    console.log(`文章 ${blog.title} 的多语言同步完成`);
  } catch (error: any) {
    console.error('多语言同步过程中发生错误:', error);
    throw new Error(`多语言同步失败: ${error.message}`);
  }

  return result;
}
