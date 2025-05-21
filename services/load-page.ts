import { getPgClient } from '@/models/db';
import { LandingPage } from '@/types/pages/landing';
import NodeCache from 'node-cache';

const landingPageCache = new NodeCache({ stdTTL: 60 });

export async function getPage<T>(locale: string, namespace: string): Promise<T> {
  try {
    const result = await getPgClient().from('page_configs').select('content').eq('locale', locale).eq('code', namespace).eq('project_id', process.env.PROJECT_ID).eq('is_deleted', false).single();
    console.log('locale', locale, 'namespace', namespace, 'result', result);
    landingPageCache.set(locale + '-' + namespace, result.data?.content as T);
    return result.data?.content as T;
  } catch (error) {
    console.log('error', error);
    console.warn(`Failed to load pages/${namespace}/${locale}.json, falling back to en.json`);
    const fallbackLocale = 'en';
    const cachedFallbackData = landingPageCache.get<LandingPage>(fallbackLocale);
    if (cachedFallbackData) {
      return cachedFallbackData as T;
    }

    const fallbackData = await import(`@/i18n/pages/${namespace}/en.json`).then(module => module.default as T);
    landingPageCache.set(fallbackLocale, fallbackData);
    return fallbackData;
  }
}
