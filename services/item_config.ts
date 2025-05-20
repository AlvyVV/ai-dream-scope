import { deleteItemConfig, findItemConfigByCode, findItemConfigById, findItemConfigsByName, getAllItemConfigs, getItemConfigsByLocale, insertItemConfig, updateItemConfig } from '@/models/item-config';
import { ItemConfig } from '@/types/item-config';

/**
 * 根据ID获取项目配置
 * @param id 配置ID
 * @returns 项目配置信息
 */
export async function getItemConfigById(id: number): Promise<ItemConfig | undefined> {
  return await findItemConfigById(id);
}

/**
 * 根据编码和语言获取项目配置
 * @param code 项目编码
 * @param locale 语言代码
 * @returns 项目配置信息
 */
export async function getItemConfigByCode(code: string, locale: string): Promise<ItemConfig | undefined> {
  return await findItemConfigByCode(code, locale);
}

/**
 * 获取所有项目配置(分页)
 * @param page 页码
 * @param limit 每页记录数
 * @returns 项目配置列表
 */
export async function getAllItems(page: number = 1, limit: number = 100): Promise<ItemConfig[]> {
  console.log('正在获取所有项目配置，页码:', page, '每页条数:', limit);
  const results = await getAllItemConfigs(page, limit);
  console.log('获取到项目配置数量:', results.length);
  if (results.length > 0) {
    console.log('第一条配置示例:', {
      id: results[0].id,
      code: results[0].code,
      name: results[0].name,
      category: results[0].category,
      locale: results[0].locale,
    });
  }
  return results;
}

/**
 * 根据语言获取项目配置(分页)
 * @param locale 语言代码
 * @param page 页码
 * @param limit 每页记录数
 * @returns 项目配置列表
 */
export async function getItemsByLocale(locale: string = 'en', page: number = 1, limit: number = 50): Promise<ItemConfig[]> {
  return await getItemConfigsByLocale(locale, page, limit);
}

/**
 * 创建项目配置
 * @param itemConfig 项目配置信息
 * @returns 创建结果
 */
export async function createItemConfig(itemConfig: Partial<ItemConfig>) {
  console.log('正在创建项目配置:', {
    code: itemConfig.code,
    name: itemConfig.name,
    category: itemConfig.category,
  });
  return await insertItemConfig(itemConfig);
}

/**
 * 更新项目配置
 * @param id 配置ID
 * @param itemConfig 更新的配置信息
 * @returns 更新结果
 */
export async function updateItem(id: number, itemConfig: Partial<ItemConfig>) {
  return await updateItemConfig(id, itemConfig);
}

/**
 * 删除项目配置
 * @param id 配置ID
 * @returns 删除结果
 */
export async function removeItemConfig(id: number): Promise<boolean> {
  return await deleteItemConfig(id);
}

/**
 * 根据名称模糊查询项目配置，并按名称长度排序
 * @param name 项目名称关键字
 * @param locale 语言代码（可选）
 * @param page 页码
 * @param limit 每页记录数
 * @returns 项目配置列表，按名称长度排序
 */
export async function findItemsByName(name: string, locale?: string, page: number = 1, limit: number = 10): Promise<ItemConfig[]> {
  console.log(`Service: findItemsByName 开始执行，参数:`, { name, locale, page, limit });

  try {
    // 调用model层的模糊查询方法
    console.log('调用 findItemConfigsByName 进行数据库查询');
    const results = await findItemConfigsByName(name, locale, page, limit);
    console.log(`数据库查询返回 ${results.length} 条结果`);

    if (results.length > 0) {
      console.log('查询结果示例:', {
        id: results[0].id,
        code: results[0].code,
        name: results[0].name,
        category: results[0].category,
      });
    }

    // 根据name长度排序，越短排越前面
    console.log('对结果按名称长度进行排序');
    const sortedResults = results.sort((a, b) => (a.name?.length || 0) - (b.name?.length || 0));

    return sortedResults;
  } catch (error) {
    console.error('Service: findItemsByName 执行错误:', error);
    throw error;
  }
}
