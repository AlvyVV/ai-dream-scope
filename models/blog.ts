import { Blog } from '@/types/blog';
import { getAdminSupabaseClient } from './db';

export enum BlogStatus {
  Offline = 0,
  Online = 1,
}

export async function insertBlog(blog: Blog) {
  blog.project_id = process.env.PROJECT_ID;
  const supabase = await getAdminSupabaseClient();
  console.log('insertBlog', blog);
  const { data, error } = await supabase.from('blogs').insert(blog);
  console.log('insertBlog', error, data);
  if (error) {
    throw error;
  }

  return data;
}

export async function updateBlog(uuid: string, blog: Partial<Blog>) {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('blogs').update(blog).eq('uuid', uuid);

  if (error) {
    throw error;
  }

  return data;
}

export async function findBlogByUuid(uuid: string): Promise<Blog | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('blogs').select('*').eq('uuid', uuid).single();

  if (error) {
    return undefined;
  }

  return data;
}

/**
 * 根据UUID和语言查找文章
 * @param uuid 文章UUID
 * @param locale 语言代码
 * @returns 文章对象或undefined
 */
export async function findBlogByUuidAndLocale(
  uuid: string,
  locale: string
): Promise<Blog | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('uuid', uuid)
    .eq('locale', locale)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function findBlogBySlug(
  slug: string,
  locale: string = 'en'
): Promise<Blog | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getAllBlogs(page: number = 1, limit: number = 50): Promise<Blog[]> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return [];
  }

  return data;
}

export async function getBlogsByLocale(
  locale: string = 'en',
  page: number = 1,
  limit: number = 50
): Promise<Blog[]> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('locale', locale)
    .eq('status', BlogStatus.Online)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return [];
  }

  return data;
}

/**
 * 删除帖子
 * @param uuid 帖子UUID
 * @returns 删除结果
 */
export async function deleteBlog(uuid: string) {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('blogs').delete().eq('uuid', uuid);

  if (error) {
    throw error;
  }

  return data;
}
