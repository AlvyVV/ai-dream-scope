import { getCategoriesByLocale } from '@/models/category';
import { getAllSimpleItemConfigs } from '@/models/item-config';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 获取所有项目配置
  const itemConfigs = await getAllSimpleItemConfigs(1, 1000);
  // 获取所有项目配置
  const itemConfigs2 = await getAllSimpleItemConfigs(2, 1000);
  // 获取所有项目配置
  const itemConfigs3 = await getAllSimpleItemConfigs(3, 1000);
  // 获取所有项目配置
  const itemConfigs4 = await getAllSimpleItemConfigs(4, 1000);

  // 基础 URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aidreamscope.com';

  // 基础站点地图条目
  const baseEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
    },
    {
      url: `${baseUrl}/dream-dictionary`,
    },
    {
      url: `${baseUrl}/dream-interpreter`,
    },
    {
      url: `${baseUrl}/about-us`,
    },
    {
      url: `${baseUrl}/blogs`,
    },
  ];

  // 获取所有分类
  const categories = await getCategoriesByLocale('en');
  const categoryEntries = categories.map(category => {
    return {
      url: `${baseUrl}/dream-dictionary-category/${encodeURIComponent(category.code)}`,
      lastModified: category.created_at || new Date().toISOString(),
    };
  });

  // 为每个符号生成站点地图条目
  const symbolEntries = itemConfigs.map(item => {
    return {
      url: `${baseUrl}/dream-dictionary/${encodeURIComponent(item.code)}`,
      lastModified: item.created_at || new Date().toISOString(),
    };
  });

  // 为每个符号生成站点地图条目
  const symbolEntries2 = itemConfigs2.map(item => {
    return {
      url: `${baseUrl}/dream-dictionary/${encodeURIComponent(item.code)}`,
      lastModified: item.created_at || new Date().toISOString(),
    };
  });

  // 为每个符号生成站点地图条目
  const symbolEntries3 = itemConfigs3.map(item => {
    return {
      url: `${baseUrl}/dream-dictionary/${encodeURIComponent(item.code)}`,
      lastModified: item.created_at || new Date().toISOString(),
    };
  });

  // 为每个符号生成站点地图条目
  const symbolEntries4 = itemConfigs4.map(item => {
    return {
      url: `${baseUrl}/dream-dictionary/${encodeURIComponent(item.code)}`,
      lastModified: item.created_at || new Date().toISOString(),
    };
  });

  // 合并所有条目
  return [...baseEntries, ...categoryEntries, ...symbolEntries, ...symbolEntries2, ...symbolEntries3, ...symbolEntries4];
}
