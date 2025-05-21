import { Category, CategoryCreateInput, CategoryPaginationInput, CategoryUpdateInput, CategoryWhereInput } from '@/types/category';
import { getAdminSupabaseClient, getPgClient } from './db';

const TABLE_NAME = 'categories';

/**
 * 创建新类别
 * @param categoryData 类别创建数据
 * @returns 创建的类别
 */
export async function createCategory(categoryData: CategoryCreateInput): Promise<Category> {
  try {
    // 获取 Supabase 客户端
    const supabase = await getAdminSupabaseClient();

    // 确保项目ID存在
    if (!categoryData.project_id) {
      categoryData.project_id = process.env.PROJECT_ID || '';
    }

    // 执行插入操作
    const { data, error } = await supabase.from(TABLE_NAME).insert(categoryData).select().single();

    if (error) {
      console.error('创建类别失败:', error.message);
      throw new Error(`创建类别失败: ${error.message}`);
    }

    if (!data) {
      throw new Error('创建类别后未返回数据');
    }

    return {
      ...data,
      created_at: new Date(data.created_at),
    };
  } catch (error: any) {
    console.error('创建类别时发生错误:', error.message);
    throw error;
  }
}

/**
 * 根据ID查询类别
 * @param id 类别ID
 * @returns 类别信息
 */
export async function getCategoryById(id: number): Promise<Category | null> {
  try {
    const supabase = await getAdminSupabaseClient();

    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();

    if (error) {
      console.error('查询类别失败:', error.message);
      throw new Error(`查询类别失败: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      ...data,
      created_at: new Date(data.created_at),
    };
  } catch (error: any) {
    console.error('查询类别时发生错误:', error.message);
    throw error;
  }
}

/**
 * 根据slug查询类别
 * @param slug 类别slug
 * @returns 类别信息
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    console.log(`[getCategoryBySlug] 开始查询类别 slug: ${slug}`);
    const pgClient = getPgClient();

    // 记录查询条件
    console.log(`[getCategoryBySlug] 查询条件: project_id=${process.env.PROJECT_ID}, data_type=dictionary, slug=${slug}`);

    const { data, error } = await pgClient.from('categories').select('*').eq('project_id', process.env.PROJECT_ID).eq('data_type', 'dictionary').eq('slug', slug).single();

    if (error) {
      console.log(`[getCategoryBySlug] 查询错误: ${error.message}`);
      if (error.code === 'PGRST116') {
        // 未找到记录
        console.log(`[getCategoryBySlug] 未找到记录: slug=${slug}`);
        return null;
      }
      console.error('[getCategoryBySlug] 查询类别失败:', error.message);
      throw new Error(`查询类别失败: ${error.message}`);
    }

    if (!data) {
      console.log(`[getCategoryBySlug] 未找到数据: slug=${slug}`);
      return null;
    }

    console.log(`[getCategoryBySlug] 成功获取类别数据: id=${data.id}, name=${data.name}`);
    return {
      ...data,
      created_at: new Date(data.created_at),
    };
  } catch (error: any) {
    console.error('查询类别时发生错误:', error.message);
    throw error;
  }
}

/**
 * 根据条件查询类别
 * @param where 查询条件
 * @param pagination 分页参数
 * @returns 类别列表
 */
export async function getCategories(where: CategoryWhereInput = {}, pagination: CategoryPaginationInput = {}): Promise<Category[]> {
  try {
    const supabase = await getAdminSupabaseClient();
    const { page = 1, pageSize = 50, orderBy } = pagination;
    const offset = (page - 1) * pageSize;

    let query = supabase.from(TABLE_NAME).select('*');

    // 应用查询条件
    if (where.id !== undefined) {
      query = query.eq('id', where.id);
    }
    if (where.project_id !== undefined) {
      query = query.eq('project_id', where.project_id);
    }
    if (where.code !== undefined) {
      query = query.eq('code', where.code);
    }
    if (where.locale !== undefined) {
      query = query.eq('locale', where.locale);
    }
    if (where.slug !== undefined) {
      query = query.eq('slug', where.slug);
    }

    // 应用排序
    if (orderBy) {
      query = query.order(orderBy.field, { ascending: orderBy.direction === 'asc' });
    } else {
      // 默认按ID降序排列
      query = query.order('id', { ascending: false });
    }

    // 应用分页
    query = query.range(offset, offset + pageSize - 1);

    const { data, error } = await query;

    if (error) {
      console.error('查询类别列表失败:', error.message);
      throw new Error(`查询类别列表失败: ${error.message}`);
    }

    return data.map(item => ({
      ...item,
      created_at: new Date(item.created_at),
    }));
  } catch (error: any) {
    console.error('查询类别列表时发生错误:', error.message);
    throw error;
  }
}

/**
 * 根据语言获取类别列表
 * @param locale 语言
 * @param pagination 分页参数
 * @returns 类别列表
 */
export async function getCategoriesByLocale(locale: string, pagination: CategoryPaginationInput = {}): Promise<Category[]> {
  return getCategories({ locale }, pagination);
}

/**
 * 更新类别信息
 * @param id 类别ID
 * @param categoryData 更新数据
 * @returns 更新后的类别
 */
export async function updateCategory(id: number, categoryData: CategoryUpdateInput): Promise<Category> {
  try {
    const supabase = await getAdminSupabaseClient();

    const { data, error } = await supabase.from(TABLE_NAME).update(categoryData).eq('id', id).select().single();

    if (error) {
      console.error('更新类别失败:', error.message);
      throw new Error(`更新类别失败: ${error.message}`);
    }

    if (!data) {
      throw new Error('更新类别后未返回数据');
    }

    return {
      ...data,
      created_at: new Date(data.created_at),
    };
  } catch (error: any) {
    console.error('更新类别时发生错误:', error.message);
    throw error;
  }
}

/**
 * 获取类别总数
 * @param where 查询条件
 * @returns 类别总数
 */
export async function getCategoryCount(where: CategoryWhereInput = {}): Promise<number> {
  try {
    const supabase = await getAdminSupabaseClient();

    let query = supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true });

    // 应用查询条件
    if (where.id !== undefined) {
      query = query.eq('id', where.id);
    }
    if (where.project_id !== undefined) {
      query = query.eq('project_id', where.project_id);
    }
    if (where.code !== undefined) {
      query = query.eq('code', where.code);
    }
    if (where.locale !== undefined) {
      query = query.eq('locale', where.locale);
    }
    if (where.slug !== undefined) {
      query = query.eq('slug', where.slug);
    }

    const { count, error } = await query;

    if (error) {
      console.error('获取类别总数失败:', error.message);
      throw new Error(`获取类别总数失败: ${error.message}`);
    }

    return count || 0;
  } catch (error: any) {
    console.error('获取类别总数时发生错误:', error.message);
    throw error;
  }
}
