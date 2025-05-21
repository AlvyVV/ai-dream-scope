// 定义页面元数据
export interface Meta {
  title: string;
  description: string;
}

// 定义头部区域
export interface Header {
  title: string;
  subtitle: string;
  description: string;
}

// 定义特性卡片
export interface FeatureCard {
  icon: string; // 图标名称，如 'Brain', 'Sparkles', 'Globe'
  title: string;
  description: string;
}

// 定义介绍卡片提示
export interface Tip {
  icon: string;
  title: string;
  description: string;
}

// 定义介绍卡片数据
export interface IntroCard {
  title: string;
  tips: Tip[];
  highlights: {
    rating: number;
    unit?: string;
    totalReviews?: string;
    text: string;
  }[];
}

// 定义用户评价
export interface Testimonial {
  title: string; // 用户名
  label: string; // 地点
  description: string; // 评价内容
  image: {
    src: string;
  };
  variant: string; // 样式变体
}

// 定义全球梦境数据库区域
export interface WorldMap {
  title: string;
  description: string;
}

// 主页面类型定义
export interface DreamInterpreterPage {
  meta: Meta;
  header: Header;
  features: FeatureCard[];
  introCard: IntroCard;
  testimonials: {
    title: string;
    items: Testimonial[];
  };
  worldMap: WorldMap;
}
