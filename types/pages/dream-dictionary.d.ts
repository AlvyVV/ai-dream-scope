// 定义页面元数据
export interface Meta {
  title: string;
  description: string;
}

// 定义Hero区域
export interface Hero {
  title: string;
  description: string;
}

// 定义分类配置
export interface CategoryConfig {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

// 定义Dream Dictionary页面的配置
export interface DreamDictionaryPage {
  meta: Meta;
  hero: Hero;
  categories?: CategoryConfig[];
  popularSymbolsTitle?: string;
  alphabetListTitle?: string;
}
