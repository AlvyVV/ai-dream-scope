import { getPgClient } from '@/models/db';
import { LandingPage } from '@/types/pages/landing';
import NodeCache from 'node-cache';

const landingPageCache = new NodeCache({ stdTTL: 3600 * 24 * 3 });

export async function getPage<T>(locale: string, namespace: string): Promise<T> {
  let normalizedLocale = locale;
  if (normalizedLocale === 'zh-CN') {
    normalizedLocale = 'zh';
  }
  normalizedLocale = normalizedLocale.toLowerCase();

  if (process.env.NODE_ENV !== 'development') {
    const cachedData = landingPageCache.get<T>(normalizedLocale);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    const result = await getPgClient()
      .from('page_configs')
      .select('content')
      .eq('locale', normalizedLocale)
      .eq('code', namespace)
      .eq('project_id', process.env.PROJECT_ID)
      .eq('is_deleted', false)
      .single();
    console.log('result', result);

    landingPageCache.set(normalizedLocale, result.data?.content as T);
    return result.data?.content as T;
  } catch (error) {
    console.log('error', error);
    console.warn(`Failed to load pages/${namespace}/${normalizedLocale}.json, falling back to en.json`);
    // Fallback logic: check cache for 'en' first
    const fallbackLocale = 'en';
    const cachedFallbackData = landingPageCache.get<LandingPage>(fallbackLocale);
    if (cachedFallbackData) {
      // console.log(`Cache hit for fallback locale: ${fallbackLocale}`);
      return cachedFallbackData as T;
    }

    // console.log(`Cache miss for fallback locale: ${fallbackLocale}. Loading from file...`);
    // Load 'en.json' if fallback is also not cached
    const fallbackData = await import(`@/i18n/pages/${namespace}/en.json`).then(module => module.default as T);
    // Store fallback data in cache
    landingPageCache.set(fallbackLocale, fallbackData);
    // console.log(`Stored fallback locale ${fallbackLocale} in cache.`);
    return fallbackData;
  }
}
