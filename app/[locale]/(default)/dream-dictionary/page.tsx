import CategorySidebar from '@/components/blocks/CategorySidebar';
import Header from '@/components/blocks/header';
import SymbolsSearch from '@/components/blocks/symbols-search';
import SymbolsAlphabetList from '@/components/blocks/SymbolsAlphabetList';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { getItemConfigCountByLocale, getItemConfigsByLocale, getItemConfigsSimpleByLocale } from '@/models/item-config';
import { getLandingPage } from '@/services/page';
import { ItemConfig } from '@/types/item-config';
import { Sparkles } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';

// import { useTranslations } from 'next-intl';

// 定义字母表数组
const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

// 获取热门梦境符号数据,分页查询
async function getPopularSymbols(locale: string): Promise<ItemConfig[]> {
  try {
    // 获取当前语言的所有项目
    return await getItemConfigsByLocale(locale, 1, 18);
  } catch (error) {
    console.error('获取热门梦境符号失败:', error);
    return [];
  }
}

// 模拟获取按字母分组的符号数据
async function getSymbolsByLetter(locale: string): Promise<ItemConfig[]> {
  try {
    // 1. 获取总数量
    const totalCount = await getItemConfigCountByLocale(locale);

    // 2. 计算需要查询多少批次(每批100个)
    const batchSize = 100;
    const batchCount = Math.ceil(totalCount / batchSize);

    // 3. 并行查询所有数据
    const fetchPromises = Array.from({ length: batchCount }, (_, i) => {
      return getItemConfigsSimpleByLocale(locale, i + 1, batchSize);
    });

    const batchResults = await Promise.all(fetchPromises);

    // 4. 合并所有结果
    return batchResults.flat() as ItemConfig[];
  } catch (error) {
    console.error('获取按字母分组的符号数据失败:', error);
    return [];
  }
}

export async function generateMetadata() {
  const locale = await getLocale();
  const page = await getLandingPage('dictionary', locale);

  return {
    title: page.meta?.title,
    description: page.meta?.description,
  };
}

export default async function DreamDictionaryPage() {
  // 获取当前语言
  const locale = await getLocale();
  const page = await getLandingPage('dictionary', locale);

  // 获取热门梦境符号
  const popularSymbols = await getPopularSymbols(locale);

  // 获取按字母分组的符号
  const symbolsByLetter = await getSymbolsByLetter(locale);

  return (
    <div className="min-h-screen">
      {/* 顶部横幅 */}
      <section className="relative mb-8 overflow-hidden bg-gradient-to-r from-purple-900/90 via-indigo-800/90 to-blue-900/90 pb-10 text-white shadow-2xl md:mb-12 md:pb-20">
        <Header></Header>

        {/* 增强背景效果 */}
        <div className="absolute -left-32 -top-32 h-80 w-80 animate-pulse-slow rounded-full bg-purple-500/30 blur-3xl"></div>
        <div className="absolute -right-32 -bottom-32 h-80 w-80 animate-pulse-slow animation-delay-2000 rounded-full bg-blue-500/30 blur-3xl"></div>
        <div className="absolute left-1/2 top-1/3 h-64 w-64 animate-pulse-slow animation-delay-1000 rounded-full bg-indigo-500/20 blur-3xl"></div>

        <div className="container relative z-10 mx-auto px-0 mt-12 md:mt-24">
          <div className="relative max-w-4xl py-3 pl-4 pr-4 border-s-4 mt-4 border-white/40 md:py-6 md:pl-8 md:pr-6 md:mt-10">
            <h1 className="mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-2xl font-extrabold leading-tight tracking-tight text-transparent md:mb-6 md:text-4xl lg:text-5xl">
              {page.hero?.title}
            </h1>
            <p className="mb-6 text-base leading-relaxed text-white/95 md:mb-10 md:text-xl lg:max-w-3xl">{page.hero?.description}</p>

            {/* 使用自定义的符号搜索组件 */}
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <SymbolsSearch placeholder="Search dream symbols..." />
            </div>

            {/* 个性化解梦按钮 */}
            <div className="mt-4 mb-2 transform transition-all duration-300 hover:scale-[1.01] md:mt-5 md:mb-0">
              <Link
                href="/dream-interpreter"
                className="flex w-full  py-3 max-w-xl items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600   px-5 text-xs font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg"
              >
                <Sparkles className="h-4 w-4 animate-pulse-slow" />
                <span>Get Your Personalized Dream Interpretation</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* A-Z 快速跳转栏 */}
      <div className="container mx-auto mb-8 px-2 sm:px-4">
        <div className="sticky top-16 z-20 rounded-xl bg-white/95 px-2 py-3 shadow-md backdrop-blur-lg dark:bg-gray-900/95 dark:shadow-gray-900/30 sm:px-3">
          <div className="w-full px-1">
            <div className="flex flex-wrap justify-center gap-2 py-1 md:gap-2">
              {alphabet.map((letter, index) => (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="group flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-purple-300 hover:bg-purple-500 hover:text-white hover:shadow-md hover:underline dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-purple-600 dark:hover:bg-purple-700 dark:hover:text-white sm:h-10 sm:w-10 sm:text-base md:h-10 md:w-10 md:font-bold relative after:absolute after:bottom-[-3px] after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:bg-purple-400 after:transition-all after:duration-200 hover:after:w-5/6"
                  style={{
                    animationDelay: `${index * 15}ms`,
                    animationDuration: '300ms',
                    animationFillMode: 'both',
                    animationName: 'fade-in',
                  }}
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* 左侧分类列表 */}
          <div className="w-full lg:w-1/4">
            <CategorySidebar />
          </div>

          {/* 右侧内容区 */}
          <div className="w-full pr-2 lg:w-3/4 sm:pr-4">
            {/* 热门符号 */}
            <section className="mb-12">
              <h2 className="mb-4 text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100 md:text-2xl md:mb-6">Common Dream Symbols</h2>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-6 md:gap-4 lg:gap-5">
                {popularSymbols.length > 0
                  ? popularSymbols.map(symbol => (
                      <Link href={`/dream-dictionary/${symbol.code}`} key={symbol.id}>
                        <Card className="group h-full overflow-hidden bg-white/90 transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900/90">
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={symbol.img || '/images/placeholders/dream-symbol.jpg'}
                              alt={symbol.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <CardHeader className="p-2 md:p-3">
                            <CardTitle className="text-center text-xs font-medium text-gray-800 dark:text-gray-100 md:text-sm">{symbol.name}</CardTitle>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))
                  : // 如果没有数据，显示占位符
                    Array.from({ length: 24 }).map((_, index) => (
                      <Card key={index} className="h-full overflow-hidden bg-white/90 dark:bg-gray-900/90">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-800"></div>
                        <CardHeader className="p-2 md:p-3">
                          <CardTitle className="text-center text-xs font-medium text-gray-800 dark:text-gray-100 md:text-sm">加载中...</CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
              </div>
            </section>

            {/* 按字母分组展示符号 */}
            <section className="mb-12 space-y-8 md:mb-16 md:space-y-10">
              <SymbolsAlphabetList symbols={symbolsByLetter} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
