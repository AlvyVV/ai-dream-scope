import { ItemConfig } from '@/types/item-config';
import { getAdminSupabaseClient } from './db';

const tableName = 'item_configs';

/**
 * 插入项目配置
 * @param itemConfig 项目配置数据
 * @returns 插入结果
 */
export async function insertItemConfig(itemConfig: Partial<ItemConfig>) {
  try {
    // 获取 Supabase 客户端
    const supabase = await getAdminSupabaseClient();

    // 确保时间戳字段存在
    if (!itemConfig.created_at) {
      itemConfig.created_at = new Date().toISOString();
    }

    itemConfig.project_id = process.env.PROJECT_ID;
    console.log('itemConfig', {
      code: itemConfig.code,
      name: itemConfig.name,
      tags: itemConfig.tags,
      locale: 'en',
      project_id: itemConfig.project_id,
    });

    // 准备插入数据 - 确保 page_config 是对象
    const sanitizedData = {
      ...itemConfig,
      page_config: typeof itemConfig.page_config === 'string' ? JSON.parse(itemConfig.page_config) : itemConfig.page_config || {},
    };
    console.log('sanitizedData', {
      code: sanitizedData.code,
      name: sanitizedData.name,
      project_id: sanitizedData.project_id,
      locale: sanitizedData.locale,
    });
    // 执行插入操作
    const { data, error } = await supabase.from(tableName).insert(sanitizedData).select();

    if (error) {
      // 详细记录错误信息
      console.error('Supabase插入错误:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      if (error.code === '23505') {
        throw new Error(`唯一性约束冲突，可能存在相同的编码和语言: ${error.details || error.message}`);
      }

      throw new Error(`数据库插入错误: ${error.message}${error.details ? ` (${error.details})` : ''}`);
    }

    console.log('项目配置插入成功:', data);
    return data;
  } catch (e: any) {
    console.error('异常详情:', e);
    throw e;
  }
}

/**
 * 更新项目配置
 * @param id 项目配置ID
 * @param itemConfig 更新数据
 * @returns 更新结果
 */
export async function updateItemConfig(id: number, itemConfig: Partial<ItemConfig>) {
  const supabase = await getAdminSupabaseClient();

  // 确保 page_config 是对象
  let updateData = { ...itemConfig };
  if (itemConfig.page_config) {
    updateData.page_config = typeof itemConfig.page_config === 'string' ? JSON.parse(itemConfig.page_config) : itemConfig.page_config;
  }

  const { data, error } = await supabase.from(tableName).update(updateData).eq('id', id).select();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 根据ID查询项目配置
 * @param id 项目配置ID
 * @returns 项目配置数据
 */
export async function findItemConfigById(id: number): Promise<ItemConfig | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from(tableName).select('id, code, locale, name, tags, category, img,sort, created_at').eq('id', id).single();

  if (error) {
    return undefined;
  }

  return data;
}

/**
 * 根据编码和语言查询项目配置
 * @param code 项目编码
 * @param locale 语言代码
 * @returns 项目配置数据
 */
export async function findItemConfigByCode(code: string, locale: string): Promise<ItemConfig | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from(tableName).select('*').eq('code', code).eq('locale', locale).single();

  if (error) {
    return undefined;
  }

  return data;
}

/**
 * 获取所有项目配置(分页)
 * @param page 页码
 * @param limit 每页记录数
 * @returns 项目配置列表
 */
export async function getAllItemConfigs(page: number = 1, limit: number = 100): Promise<ItemConfig[]> {
  try {
    const supabase = await getAdminSupabaseClient();
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('DB: 获取所有项目配置失败:', error);
      throw error;
    }

    console.log('DB: 成功获取项目配置, 数量:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('DB: 获取项目配置异常:', error);
    return [];
  }
}

/**
 * 获取所有项目配置(分页)
 * @param page 页码
 * @param limit 每页记录数
 * @returns 项目配置列表
 */
export async function getAllSimpleItemConfigs(page: number = 1, limit: number = 100): Promise<ItemConfig[]> {
  try {
    const supabase = await getAdminSupabaseClient();
    const { data, error } = await supabase
      .from(tableName)
      .select('code,created_at')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('DB: 获取所有项目配置失败:', error);
      throw error;
    }

    console.log('DB: 成功获取项目配置, 数量:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('DB: 获取项目配置异常:', error);
    return [];
  }
}

/**
 * 获取指定语言下项目配置的总数
 * @param locale 语言代码
 * @returns 项目配置总数
 */
export async function getItemConfigCountByLocale(locale: string): Promise<number> {
  try {
    const supabase = await getAdminSupabaseClient();
    const { count, error } = await supabase.from('item_configs').select('*', { count: 'exact', head: true }).eq('locale', locale);

    if (error) {
      console.error('获取项目配置总数失败:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('获取项目配置总数时发生错误:', error);
    return 0;
  }
}

/**
 * 根据语言获取项目配置(分页)
 * @param locale 语言代码
 * @param page 页码
 * @param limit 每页记录数
 * @returns 项目配置列表
 */
export async function getItemConfigsByLocale(locale: string = 'en', page: number = 1, limit: number = 50): Promise<ItemConfig[]> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from(tableName)
    .select('id, code, locale, name, tags, category, img, sort,created_at')
    .eq('locale', locale)
    .order('sort', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * 根据语言获取项目简单配置(分页)
 * @param locale 语言代码
 * @param page 页码
 * @param limit 每页记录数
 * @returns 项目配置列表
 */
export async function getItemConfigsSimpleByLocale(locale: string = 'en', page: number = 1, limit: number = 50): Promise<Pick<ItemConfig, 'code' | 'name'>[]> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from(tableName)
    .select('code, name, img')
    .eq('locale', locale)
    .order('sort', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * 删除项目配置
 * @param id 项目配置ID
 * @returns 是否删除成功
 */
export async function deleteItemConfig(id: number): Promise<boolean> {
  const supabase = await getAdminSupabaseClient();
  const { error } = await supabase.from(tableName).delete().eq('id', id);

  if (error) {
    throw error;
  }

  return true;
}

export async function listPageConfigsByCategory() {
  const supabase = await getAdminSupabaseClient();

  // 使用原始SQL查询代替groupBy
  const { data, error } = await supabase.rpc('get_items_configs_by_category').select();

  if (error) {
    console.error('获取页面配置分类统计失败:', error);
    return [];
  }

  return data;
}

/**
 * 根据名称模糊查询项目配置
 * @param name 项目名称关键字
 * @param locale 语言代码（可选）
 * @param page 页码
 * @param limit 每页记录数
 * @returns 项目配置列表
 */
export async function findItemConfigsByName(name: string, locale?: string, page: number = 1, limit: number = 10): Promise<ItemConfig[]> {
  try {
    console.log(`DB: findItemConfigsByName 开始执行，参数:`, { name, locale, page, limit });
    const supabase = await getAdminSupabaseClient();
    console.log('DB: 已获取数据库连接');

    console.log(`DB: 构建查询 - 模糊查询name: '%${name}%'${locale ? `, 精确匹配locale: '${locale}'` : ''}`);
    let query = supabase.from(tableName).select('id, code, locale, name, tags, category, img, sort, created_at, description').ilike('name', `%${name}%`).order('created_at', { ascending: false });

    // 如果提供了语言参数，则添加语言筛选条件
    if (locale) {
      query = query.eq('locale', locale);
    }

    // 添加分页
    const pageStart = (page - 1) * limit;
    const pageEnd = page * limit - 1;
    console.log(`DB: 添加分页 - 范围 ${pageStart} 到 ${pageEnd}`);

    const { data, error } = await query.range(pageStart, pageEnd);

    if (error) {
      console.error('DB: 根据名称查询项目配置失败:', error);
      console.error('错误详情:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('DB: 根据名称查询项目配置异常:', error);
    if (error instanceof Error) {
      console.error('错误堆栈:', error.stack);
    }
    return [];
  }
}

/**
 * 根据标签数组查询项目配置
 * @param tags 标签数组
 * @param locale 语言代码（可选）
 * @param page 页码
 * @param limit 每页记录数
 * @returns 项目配置列表
 */
export async function findItemConfigsByTags(tags: string[], locale?: string, page: number = 1, limit: number = 10): Promise<ItemConfig[]> {
  try {
    const supabase = await getAdminSupabaseClient();

    // 构建查询
    let query = supabase.from(tableName).select('id, code, locale, name, tags, category, img, sort, created_at, description').order('created_at', { ascending: false });

    // Supabase支持使用contains操作符来检查数组是否包含指定元素
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    // 如果提供了语言参数，则添加语言筛选条件
    if (locale) {
      query = query.eq('locale', locale);
    }

    // 添加分页
    const pageStart = (page - 1) * limit;
    const pageEnd = page * limit - 1;

    const { data, error } = await query.range(pageStart, pageEnd);

    if (error) {
      console.error('DB: 根据标签查询项目配置失败:', error);
      console.error('错误详情:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('DB: 根据标签查询项目配置异常:', error);
    if (error instanceof Error) {
      console.error('错误堆栈:', error.stack);
    }
    return [];
  }
}

/**
 * 根据分类查找最新的项目配置
 * @param category 分类名称
 * @param locale 语言代码
 * @param limit 返回记录数量
 * @returns 项目配置列表
 */
export async function findLatestItemConfigsByCategory(category: string, locale: string, limit: number = 3): Promise<ItemConfig[]> {
  try {
    const supabase = await getAdminSupabaseClient();

    const { data, error } = await supabase
      .from(tableName)
      .select('id, code, locale, name, tags, category, img, sort, created_at, description')
      .eq('category', category)
      .eq('locale', locale)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('DB: 根据分类查询最新项目配置失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('DB: 根据分类查询最新项目配置异常:', error);
    return [];
  }
}

/**
 * 根据分类查询项目配置
 * @param category 分类名称
 * @param locale 语言代码
 * @param page 页码
 * @param limit 每页记录数
 * @returns 项目配置列表
 */
export async function findItemConfigsByCategory(category: string, locale: string, page: number = 1, limit: number = 100): Promise<ItemConfig[]> {
  try {
    console.log(`DB: findItemConfigsByCategory 开始执行，参数:`, { category, locale, page, limit });
    const supabase = await getAdminSupabaseClient();

    // 构建查询条件
    let query = supabase.from(tableName).select('id, code, locale, name, tags, category, img, sort, created_at, description').order('sort', { ascending: false });

    // 分类查询 - 注意：分类可能存在于 category 字段或 tags 数组中
    query = query.or(`category.eq.${category},tags.cs.{"${category}"}`);

    // 添加语言筛选
    query = query.eq('locale', locale);

    // 添加分页
    const pageStart = (page - 1) * limit;
    const pageEnd = page * limit - 1;

    const { data, error } = await query.range(pageStart, pageEnd);

    if (error) {
      console.error('DB: 根据分类查询项目配置失败:', error);
      console.error('错误详情:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('DB: 根据分类查询项目配置异常:', error);
    if (error instanceof Error) {
      console.error('错误堆栈:', error.stack);
    }
    return [];
  }
}
