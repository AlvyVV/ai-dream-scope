import { findDictionaryItemsByCodePrefix } from '@/models/item-config';
import { ItemConfig } from '@/types/item-config';
import NodeCache from 'node-cache';

// 创建缓存实例，设置缓存时间为3小时（10800秒）
const dictionaryCache = new NodeCache({ stdTTL: 10800 });

// 定义字母表数组，用于并行查询
const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

/**
 * 根据分类获取字典项并缓存结果
 * @param locale 语言代码
 * @param category 分类名称
 * @returns 字典项列表
 */
export async function getDictionaryItemsByCategory(locale: string, category: string): Promise<ItemConfig[]> {
  try {
    // 生成缓存键（语言-分类）
    const cacheKey = `${locale}-${category}-dict-items`;

    // 检查缓存中是否有数据
    const cachedData = dictionaryCache.get<ItemConfig[]>(cacheKey);
    if (cachedData) {
      console.log(`缓存命中: ${cacheKey}, 项目数: ${cachedData.length}`);
      return cachedData;
    }

    console.log(`缓存未命中: ${cacheKey}, 开始多线程查询...`);

    // 创建字母查询任务数组
    const queryTasks = alphabet.map(letter => {
      return fetchItemsByPrefix(locale, letter.toLowerCase(), category);
    });

    // 并行执行所有查询任务
    const results = await Promise.all(queryTasks);

    // 合并所有结果
    const allItems = results.flat();

    console.log(`查询完成: ${cacheKey}, 总项目数: ${allItems.length}`);

    // 将结果保存到缓存
    dictionaryCache.set(cacheKey, allItems);

    return allItems;
  } catch (error) {
    console.error('获取并缓存字典项出错:', error);
    return [];
  }
}

/**
 * 根据前缀获取字典项
 * @param locale 语言代码
 * @param prefix 代码前缀
 * @param category 分类名称（可选）
 * @returns 字典项列表
 */
async function fetchItemsByPrefix(locale: string, prefix: string, category?: string): Promise<ItemConfig[]> {
  try {
    // 查询以特定字母开头的字典项，限制400条
    const items = await findDictionaryItemsByCodePrefix(prefix, locale, 1, 400);

    // 将结果转换为ItemConfig格式
    return items.map(item => ({
      code: item.code,
      name: item.code.charAt(0).toUpperCase() + item.code.slice(1).replace(/-/g, ' '), // 将code转换为显示名称
      category: category || 'dictionary',
    }));
  } catch (error) {
    console.error(`查询前缀 ${prefix} 的字典项出错:`, error);
    return [];
  }
}

/**
 * 手动清除字典缓存
 * @param locale 语言代码（可选，如果不提供则清除所有缓存）
 * @param category 分类名称（可选，如果不提供则清除指定语言的所有缓存）
 * @returns 清除的键数量
 */
export function clearDictionaryCache(locale?: string, category?: string): number {
  if (!locale && !category) {
    // 清除所有缓存
    return dictionaryCache.flushAll();
  } else if (locale && !category) {
    // 清除指定语言的所有缓存
    const keys = dictionaryCache.keys().filter(key => key.startsWith(`${locale}-`));
    return dictionaryCache.del(keys);
  } else if (locale && category) {
    // 清除指定语言和分类的缓存
    const cacheKey = `${locale}-${category}-dict-items`;
    return dictionaryCache.del(cacheKey);
  }

  return 0;
}
