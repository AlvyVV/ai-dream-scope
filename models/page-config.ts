import { PageConfig } from '@/types/page-config';
import { getAdminSupabaseClient } from './db';

export enum PageConfigStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
}

export async function insertPageConfig(pageConfig: Partial<PageConfig>) {
  console.log('准备插入页面配置:', JSON.stringify(pageConfig, null, 2));

  try {
    // 获取 Supabase 客户端
    const supabase = await getAdminSupabaseClient();

    // 确保时间戳字段存在
    if (!pageConfig.created_at) {
      pageConfig.created_at = new Date().toISOString();
    }
    if (!pageConfig.updated_at) {
      pageConfig.updated_at = pageConfig.created_at;
    }

    // 确保版本号存在
    if (!pageConfig.version) {
      pageConfig.version = 1;
    }

    // 准备插入数据 - 确保数据类型正确
    const sanitizedData = {
      ...pageConfig,
      // 确保这些是对象而不是字符串
      content:
        typeof pageConfig.content === 'string'
          ? JSON.parse(pageConfig.content)
          : pageConfig.content || {},
      meta:
        typeof pageConfig.meta === 'string' ? JSON.parse(pageConfig.meta) : pageConfig.meta || {},
    };

    sanitizedData.project_id = process.env.PROJECT_ID || '';
    console.log(
      '准备插入数据:',
      JSON.stringify(sanitizedData, null, 2),
      (await supabase.auth.getUser()).data.user?.id
    );
    // 执行插入操作
    const { data, error } = await supabase.from('page_configs').insert(sanitizedData).select();

    if (error) {
      // 详细记录错误信息
      console.error('Supabase插入错误:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      if (error.code === '23505') {
        throw new Error(
          `唯一性约束冲突，可能存在相同的代码和语言: ${error.details || error.message}`
        );
      }

      throw new Error(
        `数据库插入错误: ${error.message}${error.details ? ` (${error.details})` : ''}`
      );
    }

    console.log('页面配置插入成功:', data);
    return data;
  } catch (e: any) {
    console.error('异常详情:', e);

    // 提取错误信息的各个部分
    let errorMessage: string;
    if (typeof e === 'string') {
      errorMessage = e;
    } else if (e instanceof Error) {
      errorMessage = `${e.name}: ${e.message}`;
      console.error('错误堆栈:', e.stack);
    } else if (e && typeof e === 'object') {
      const details = Object.entries(e)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join(', ');
      errorMessage = details || 'Unknown error object';
    } else {
      errorMessage = 'Unknown error';
    }

    console.error('插入页面配置失败:', errorMessage);
    throw typeof e === 'object' && e !== null ? e : new Error(errorMessage);
  }
}

export async function updatePageConfig(id: number, pageConfig: Partial<PageConfig>) {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('page_configs').update(pageConfig).eq('id', id);

  if (error) {
    throw error;
  }

  return data;
}

export async function findPageConfigById(id: number): Promise<PageConfig | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase.from('page_configs').select('*').eq('id', id).single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function findPageConfigByCode(
  code: string,
  locale: string
): Promise<PageConfig | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('page_configs')
    .select('*')
    .eq('code', code)
    .eq('locale', locale)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getAllPageConfigs(
  page: number = 1,
  limit: number = 50
): Promise<PageConfig[]> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('page_configs')
    .select('*')
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return [];
  }

  return data;
}

export async function getPageConfigsByLocale(
  locale: string = 'en',
  page: number = 1,
  limit: number = 50
): Promise<PageConfig[]> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('page_configs')
    .select('*')
    .eq('locale', locale)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return [];
  }

  return data;
}

export async function deletePageConfig(id: number): Promise<boolean> {
  const supabase = await getAdminSupabaseClient();
  const { error } = await supabase.from('page_configs').delete().eq('id', id);

  if (error) {
    return false;
  }

  return true;
}

/**
 * 查找指定代码和语言的最新版本页面配置
 * @param code 页面配置代码
 * @param locale 语言代码
 * @returns 最新版本的页面配置，如果不存在则返回undefined
 */
export async function findLatestPageConfigByCode(
  code: string,
  locale: string
): Promise<PageConfig | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('page_configs')
    .select('*')
    .eq('code', code)
    .eq('locale', locale)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.log(`未找到代码为 ${code}、语言为 ${locale} 的页面配置:`, error);
    return undefined;
  }

  return data;
}

/**
 * 批量发布指定代码和版本的页面配置，并将低版本设为归档
 * @param code 页面配置代码
 * @param version 版本号
 * @returns 更新结果，包含更新数量和更新的记录ID
 */
export async function publishPageConfigsByCodeAndVersion(code: string, version: number) {
  try {
    const supabase = await getAdminSupabaseClient();

    // 首先查询英文版本，确认它是否存在且为草稿状态
    const { data: enConfig, error: enError } = await supabase
      .from('page_configs')
      .select('id, code, locale, status, version')
      .eq('code', code)
      .eq('version', version)
      .eq('locale', 'en')
      .single();

    if (enError || !enConfig) {
      const message = enError ? enError.message : '找不到对应的英文版本配置';
      console.error('查找英文版本时出错:', message);
      throw new Error(`无法发布: ${message}`);
    }

    // 检查英文版本状态
    if (enConfig.status !== PageConfigStatus.Draft) {
      // 如果英文版本已发布或已归档，则不允许发布
      const statusText = enConfig.status === PageConfigStatus.Published ? '已发布' : '已归档';
      throw new Error(`英文版本已经是${statusText}状态，无法重复发布`);
    }

    // 查找所有语言版本
    const { data: configs, error: findError } = await supabase
      .from('page_configs')
      .select('id, code, locale, status, version')
      .eq('code', code)
      .eq('version', version);

    if (findError) {
      console.error('查找所有语言版本时出错:', findError);
      throw new Error(`查找所有语言版本失败: ${findError.message}`);
    }

    if (!configs || configs.length === 0) {
      return { count: 0, updated: [] };
    }

    console.log(`找到 ${configs.length} 条待发布的页面配置`);

    // 过滤出非已发布状态的记录
    const recordsToUpdate = configs.filter(config => config.status !== PageConfigStatus.Published);

    if (recordsToUpdate.length === 0) {
      return { count: 0, updated: [], message: '没有需要发布的记录' };
    }

    console.log(`其中 ${recordsToUpdate.length} 条记录需要发布`);

    // 构建更新数据
    const currentTime = new Date().toISOString();
    const updatedRecords = [];

    // 逐个更新记录
    for (const record of recordsToUpdate) {
      const { error: updateError } = await supabase
        .from('page_configs')
        .update({
          status: PageConfigStatus.Published,
          updated_at: currentTime,
        })
        .eq('id', record.id);

      if (updateError) {
        console.error(`更新记录 ${record.id} (${record.locale}) 失败:`, updateError);
      } else {
        updatedRecords.push({
          id: record.id,
          locale: record.locale,
        });
        console.log(`记录 ${record.id} (${record.locale}) 更新为已发布状态`);
      }
    }

    // 将所有低版本的记录设置为归档状态
    console.log(`准备将代码 ${code} 的所有低版本记录设置为归档状态`);

    // 查找所有低版本的记录
    const { data: olderVersions, error: olderError } = await supabase
      .from('page_configs')
      .select('id, locale, version, status')
      .eq('code', code)
      .lt('version', version)
      .neq('status', PageConfigStatus.Archived); // 只选择未归档的记录

    if (olderError) {
      console.error(`查找低版本记录时出错:`, olderError);
    } else if (olderVersions && olderVersions.length > 0) {
      console.log(`找到 ${olderVersions.length} 条低版本记录需要归档`);

      // 归档旧版本
      const archivedRecords = [];

      for (const oldRecord of olderVersions) {
        const { error: archiveError } = await supabase
          .from('page_configs')
          .update({
            status: PageConfigStatus.Archived,
            updated_at: currentTime,
          })
          .eq('id', oldRecord.id);

        if (archiveError) {
          console.error(
            `归档记录 ${oldRecord.id} (${oldRecord.locale}, v${oldRecord.version}) 失败:`,
            archiveError
          );
        } else {
          archivedRecords.push({
            id: oldRecord.id,
            locale: oldRecord.locale,
            version: oldRecord.version,
          });
          console.log(`记录 ${oldRecord.id} (${oldRecord.locale}, v${oldRecord.version}) 已归档`);
        }
      }

      // 添加归档记录到结果中
      return {
        count: updatedRecords.length,
        updated: updatedRecords,
        archived: archivedRecords,
        archived_count: archivedRecords.length,
        message: `已发布 ${code} (版本 ${version}) 的 ${updatedRecords.length} 条记录，并归档了 ${archivedRecords.length} 条旧版本记录`,
      };
    }

    // 更新语言列表
    const updatedLanguages = updatedRecords.map(record => record.locale).join(', ');

    return {
      count: updatedRecords.length,
      updated: updatedRecords,
      message: `已发布 ${code} (版本 ${version}) 的 ${updatedRecords.length} 条记录 (${updatedLanguages})`,
    };
  } catch (error: any) {
    console.error('批量发布页面配置时出错:', error);
    throw error;
  }
}

/**
 * 查找小于指定版本号的最大版本页面配置
 * @param code 页面配置代码
 * @param locale 语言代码
 * @param currentVersion 当前版本号
 * @returns 小于当前版本号的最大版本记录，如果不存在则返回undefined
 */
export async function findPreviousVersionPageConfig(
  code: string,
  locale: string,
  currentVersion: number
): Promise<PageConfig | undefined> {
  const supabase = await getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('page_configs')
    .select('*')
    .eq('code', code)
    .eq('locale', locale)
    .lt('version', currentVersion) // 查找小于当前版本的记录
    .order('version', { ascending: false }) // 按版本号降序排列
    .limit(1)
    .single();

  if (error) {
    console.log(
      `未找到代码为 ${code}、语言为 ${locale}、版本小于 ${currentVersion} 的页面配置:`,
      error
    );
    return undefined;
  }

  return data;
}
