import { Image } from '@/types/blocks/base';

// 符号相关类型
export interface MeaningPill {
  text: string;
}

export interface CommonScenario {
  title: string;
  content: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RelatedSymbol {
  title: string;
  description?: string;
  url: string;
}

// 主页面结构
export interface SymbolInterpretation {
  // 元数据
  meta: {
    title: string;
    description: string;
  };

  // A. 符号介绍区
  symbolIntro: {
    title: string;
    symbolName: string;
    symbolCategory: string;
    quickMeaning: string;
    image: Image;
    meaningPills?: MeaningPill[];
  };

  // B. 综合解读区
  interpretation: {
    title: string;
    description: string;
    commonScenarios: {
      title: string;
      content: string;
    };
  };

  // C. 个性化解读指南
  personalGuide: {
    title: string;
    description: string;
    steps?: {
      title: string;
      description: string;
    }[];
    questions?: string[];
  };

  // D. 梦境解析示例
  dreamInterpretationExamples: {
    title: string;
    description: string;
    examples?: {
      scenario: string;
      analysis: string;
    }[];
  };

  // F. 常见问题
  faq: {
    title: string;
    content: string;
    items?: FaqItem[];
  };

  // G. 建议解读
  suggestions: {
    title: string;
    content: string;
  };
}
