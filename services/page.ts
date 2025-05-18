import { LandingPage } from '@/types/pages/landing';

export async function getLandingPage(filename: string, locale: string): Promise<LandingPage> {
  try {
    if (locale === 'zh-CN') {
      locale = 'zh';
    }
    return await import(`@/i18n/pages/${filename}/${locale.toLowerCase()}.json`).then(module => module.default);
  } catch (error) {
    console.warn(`Failed to load ${filename}/${locale}.json, falling back to en.json`);
    return await import(`@/i18n/pages/${filename}/en.json`).then(module => module.default as LandingPage);
  }
}

export async function getBlocks<T>(name: string, locale: string): Promise<T> {
  try {
    if (locale === 'zh-CN') {
      locale = 'zh';
    }
    return await import(`@/i18n/blocks/${name}/${locale.toLowerCase()}.json`).then(module => module.default);
  } catch (error) {
    console.warn(`Failed to load blocks/${name}/${locale}.json, falling back to en.json`);
    return await import(`@/i18n/blocks/${name}/en.json`).then(module => module.default as T);
  }
}
