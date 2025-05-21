import { ItemConfig } from '@/types/item-config';
import NodeCache from 'node-cache';
import { getPgClient } from './db';

// 创建缓存实例，设置缓存时间为30分钟
const dictionaryCache = new NodeCache({ stdTTL: 1800 });

/**
 * 使用pgclient获取热门梦境符号
 * @param locale 语言代码
 * @param limit 返回数量限制
 * @param categoryId 分类ID（可选）
 * @returns 热门梦境符号列表
 */
export async function getPopularDictionaryItems(locale: string, limit: number = 18, categoryId?: string): Promise<ItemConfig[]> {
  try {
    // 生成缓存键
    const cacheKey = `${locale}-popular-dictionary-items-${limit}${categoryId ? `-category-${categoryId}` : ''}`;

    // 检查缓存
    const cachedData = dictionaryCache.get<ItemConfig[]>(cacheKey);
    if (cachedData) {
      console.log(`缓存命中: ${cacheKey}, 项目数: ${cachedData.length}`);
      return cachedData;
    }

    console.log(`[getPopularDictionaryItems] 使用pgclient获取热门梦境符号，参数: locale=${locale}, limit=${limit}${categoryId ? `, categoryId=${categoryId}` : ''}`);

    const pgClient = getPgClient();

    // 构建查询
    let query = pgClient.from('item_configs').select('slug, name, content').gt('sort', '0').eq('project_id', process.env.PROJECT_ID).eq('locale', locale);

    // 如果有分类ID，增加筛选条件
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // 执行查询，添加排序和限制
    const { data, error } = await query.order('sort', { ascending: false }).limit(limit);

    if (error) {
      console.error('[getPopularDictionaryItems] 获取热门梦境符号失败:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log(`[getPopularDictionaryItems] 未找到热门梦境符号: locale=${locale}${categoryId ? `, categoryId=${categoryId}` : ''}`);
      return [];
    }

    console.log(`[getPopularDictionaryItems] 成功获取热门梦境符号: count=${data.length}`);

    // 处理数据，从 content 中提取 hero_image 作为 img 字段，同时将 slug 赋值给 code 字段
    const processedData = data.map(item => {
      return {
        ...item,
        // 确保满足 ItemConfig 类型要求，slug 赋值给 code
        code: item.slug || '',
        img: item.content?.hero_image || null,
      };
    });

    // 缓存结果
    dictionaryCache.set(cacheKey, processedData);

    return processedData;
  } catch (error) {
    console.error('[getPopularDictionaryItems] 获取热门梦境符号时发生错误:', error);
    return [];
  }
}

/**
 * 使用pgclient获取字典项总数
 * @param locale 语言代码
 * @param categoryId 分类ID（可选）
 * @returns 字典项总数
 */
export async function getDictionaryItemCount(locale: string, categoryId?: string): Promise<number> {
  try {
    // 生成缓存键
    const cacheKey = `${locale}-dictionary-item-count${categoryId ? `-category-${categoryId}` : ''}`;

    // 检查缓存
    const cachedCount = dictionaryCache.get<number>(cacheKey);
    if (cachedCount !== undefined) {
      console.log(`缓存命中: ${cacheKey}, 数量: ${cachedCount}`);
      return cachedCount;
    }

    console.log(`[getDictionaryItemCount] 使用pgclient获取字典项总数，参数: locale=${locale}${categoryId ? `, categoryId=${categoryId}` : ''}`);

    const pgClient = getPgClient();

    // 构建查询
    let query = pgClient.from('item_configs').select('*', { count: 'exact', head: true }).eq('project_id', process.env.PROJECT_ID).eq('locale', locale);

    // 如果有分类ID，增加筛选条件
    if (categoryId) {
      query = query.eq('category', categoryId);
    }

    // 获取字典项总数
    const { count, error } = await query;

    if (error) {
      console.error('[getDictionaryItemCount] 获取字典项总数失败:', error);
      return 0;
    }

    console.log(`[getDictionaryItemCount] 成功获取字典项总数: count=${count}`);

    // 缓存结果
    dictionaryCache.set(cacheKey, count || 0);

    return count || 0;
  } catch (error) {
    console.error('[getDictionaryItemCount] 获取字典项总数时发生错误:', error);
    return 0;
  }
}

/**
 * 使用pgclient获取分页字典项
 * @param locale 语言代码
 * @param page 页码
 * @param limit 每页数量
 * @param categoryId 分类ID（可选）
 * @returns 字典项列表
 */
export async function getDictionaryItemsByPage(locale: string, page: number = 1, limit: number = 100, categoryId?: string): Promise<ItemConfig[]> {
  try {
    // 生成缓存键
    const cacheKey = `${locale}-dictionary-items-page-${page}-limit-${limit}${categoryId ? `-category-${categoryId}` : ''}`;

    // 检查缓存
    const cachedData = dictionaryCache.get<ItemConfig[]>(cacheKey);
    if (cachedData) {
      console.log(`缓存命中: ${cacheKey}, 项目数: ${cachedData.length}`);
      return cachedData;
    }

    console.log(`[getDictionaryItemsByPage] 使用pgclient获取分页字典项，参数: locale=${locale}, page=${page}, limit=${limit}${categoryId ? `, categoryId=${categoryId}` : ''}`);

    const pgClient = getPgClient();
    const offset = (page - 1) * limit;

    // 构建查询
    let query = pgClient.from('item_configs').select('code, slug, name, content').eq('project_id', process.env.PROJECT_ID).eq('locale', locale);

    // 如果有分类ID，增加筛选条件
    if (categoryId) {
      query = query.eq('category', categoryId);
    }

    // 执行分页查询
    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('[getDictionaryItemsByPage] 获取分页字典项失败:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log(`[getDictionaryItemsByPage] 未找到分页字典项: locale=${locale}, page=${page}${categoryId ? `, categoryId=${categoryId}` : ''}`);
      return [];
    }

    console.log(`[getDictionaryItemsByPage] 成功获取分页字典项: count=${data.length}`);

    // 处理数据，从 content 中提取 hero_image 作为 img 字段
    const processedData = data.map(item => {
      return {
        ...item,
        img: item.content?.hero_image || null,
      };
    });

    // 缓存结果
    dictionaryCache.set(cacheKey, processedData);

    return processedData;
  } catch (error) {
    console.error('[getDictionaryItemsByPage] 获取分页字典项时发生错误:', error);
    return [];
  }
}

/**
 * 使用pgclient获取按字母分组的所有字典项
 * @param locale 语言代码
 * @param categoryId 分类ID（可选）
 * @returns 所有字典项列表
 */
export async function getAllDictionaryItems(locale: string, categoryId?: string): Promise<ItemConfig[]> {
  try {
    // 生成缓存键
    const cacheKey = `${locale}-all-dictionary-items${categoryId ? `-category-${categoryId}` : ''}`;

    // 检查缓存
    const cachedData = dictionaryCache.get<ItemConfig[]>(cacheKey);
    if (cachedData) {
      console.log(`缓存命中: ${cacheKey}, 项目数: ${cachedData.length}`);
      return cachedData;
    }

    console.log(`[getAllDictionaryItems] 使用pgclient获取所有字典项，参数: locale=${locale}${categoryId ? `, categoryId=${categoryId}` : ''}`);

    // 1. 获取总数量
    const totalCount = await getDictionaryItemCount(locale, categoryId);

    // 2. 计算需要查询多少批次(每批100个)
    const batchSize = 1000;
    const batchCount = Math.ceil(totalCount / batchSize);

    // 3. 并行查询所有数据
    const fetchPromises = Array.from({ length: batchCount }, (_, i) => {
      return getDictionaryItemsByPage(locale, i + 1, batchSize, categoryId);
    });

    const batchResults = await Promise.all(fetchPromises);

    // 4. 合并所有结果
    const allItems = batchResults.flat();

    console.log(`[getAllDictionaryItems] 成功获取所有字典项: count=${allItems.length}`);

    // 缓存结果
    dictionaryCache.set(cacheKey, allItems);

    return allItems;
  } catch (error) {
    console.error('[getAllDictionaryItems] 获取所有字典项时发生错误:', error);
    return [];
  }
}
