import { getPgClient } from '@/models/db';
import NodeCache from 'node-cache';

const componentCache = new NodeCache({ stdTTL: 60 });

export async function getComponent<T>(locale: string, namespace: string): Promise<T> {
  const cachedData = componentCache.get<T>(locale + '-' + namespace);
  if (cachedData) {
    return cachedData;
  }

  try {
    const result = await getPgClient().from('components').select('content').eq('locale', locale).eq('code', namespace).eq('project_id', process.env.PROJECT_ID).eq('is_deleted', false).single();
    componentCache.set(locale + '-' + namespace, result.data?.content as T);
    return result.data?.content as T;
  } catch (error) {
    console.warn(`Failed to load ${namespace} ${locale}.json, falling back to en.json`);
    const fallbackLocale = 'en';
    const cachedFallbackData = componentCache.get<T>(fallbackLocale);
    if (cachedFallbackData) {
      return cachedFallbackData as T;
    }

    return {} as T;
  }
}
