import CategorySidebar from '@/components/blocks/CategorySidebar';
import SymbolsAlphabetList from '@/components/blocks/SymbolsAlphabetList';
import Header from '@/components/blocks/header';
import SymbolsSearch from '@/components/blocks/symbols-search';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategoryBySlug } from '@/models/category';
import { getAllDictionaryItems, getPopularDictionaryItems } from '@/models/dictionary';
import { findItemConfigsByCategory } from '@/models/item-config';
import { ItemConfig } from '@/types/item-config';
import { HomeIcon, TagIcon } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Get popular symbols for a specific category
async function getCategoryPopularSymbols(locale: string, categoryId: string): Promise<ItemConfig[]> {
  try {
    // 确保category首字母大写并处理连字符
    const capitalizedCategory = categoryId
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // 使用getPopularDictionaryItems方法获取数据，支持categoryId筛选
    const categoryItems = await getPopularDictionaryItems(locale, 12, categoryId);

    // 过滤出有图片的符号
    return categoryItems.filter(item => item.img);
  } catch (error) {
    console.error(`Failed to get popular dream symbols for category [${categoryId}]:`, error);
    return [];
  }
}

// Get all symbols for a specific category
async function getCategoryItems(locale: string, categorySlug: string): Promise<ItemConfig[]> {
  try {
    // 确保category首字母大写并处理连字符
    const capitalizedCategory = categorySlug
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // 使用改造后的getAllDictionaryItems方法，支持categoryId筛选
    const dictionaryItems = await getAllDictionaryItems(locale, capitalizedCategory);

    // 如果未获取到数据，则回退到原来的查询方法
    if (dictionaryItems.length === 0) {
      console.log(`未通过getAllDictionaryItems获取到分类 [${categorySlug}] 的字典项，回退到常规查询...`);
      return await findItemConfigsByCategory(capitalizedCategory, locale, 1, 1000);
    }

    return dictionaryItems;
  } catch (error) {
    console.error(`Failed to get all dream symbols for category [${categorySlug}]:`, error);
    // 出错时回退到原来的查询方法
    try {
      const capitalizedCategory = categorySlug
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return await findItemConfigsByCategory(capitalizedCategory, locale, 1, 1000);
    } catch {
      return [];
    }
  }
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const { category } = resolvedParams;
  console.log('generateMetadata - Fetching category:', category);

  const categoryInfo = await getCategoryBySlug(category);

  if (!categoryInfo) return { notFound: true };

  // Get SEO info from page_config
  const pageConfig = categoryInfo.page_config || {};
  const meta = pageConfig.meta || {};

  return {
    title: meta.title || `${categoryInfo.name} Dream Symbols | Explore the Meaning of ${categoryInfo.name} Dreams`,
    description:
      meta.description ||
      `Explore the meaning of ${categoryInfo.name} dream symbols, learn their interpretations in cultural, psychological, and personal contexts, and find the hidden messages in your dreams.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  // Get current language for other functions
  const locale = await getLocale();
  const resolvedParams = await params;
  const { category } = resolvedParams;

  console.log('CategoryPage - Fetching category:', category);

  const categoryInfo = await getCategoryBySlug(category);

  if (!categoryInfo) {
    console.log('Category not found:', category);
    notFound();
  }

  const pageConfig = categoryInfo.page_config || {};

  const heroContent = pageConfig.hero || {};

  // 增加错误处理，防止在获取热门符号和所有符号时出错
  let categoryPopularSymbols: ItemConfig[] = [];
  try {
    categoryPopularSymbols = await getCategoryPopularSymbols(locale, categoryInfo.category_id);
  } catch (error) {
    console.error('Error fetching popular symbols:', error);
    categoryPopularSymbols = [];
  }

  let allCategorySymbols: ItemConfig[] = [];
  try {
    allCategorySymbols = await getCategoryItems(locale, category);
  } catch (error) {
    console.error('Error fetching all category symbols:', error);
    allCategorySymbols = [];
  }

  const hasSymbols = categoryPopularSymbols.length > 0;

  return (
    <main className="min-h-screen">
      {/* Top banner */}
      <section className="relative   overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 pb-16 text-white shadow-xl">
        <Header></Header>

        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-purple-500/30 blur-3xl"></div>
        <div className="absolute -right-32 -bottom-32 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl"></div>

        <div className="container relative z-10 mx-auto px-4 mt-24">
          {/* Full-width title section */}
          <div className="mb-8 relative">
            <div className="absolute left-0 top-0 w-1 h-24 bg-gradient-to-b from-purple-400 to-transparent opacity-70 rounded-full"></div>
            <div className="pl-6">
              <h1 className="bg-gradient-to-r from-white via-white to-purple-100 bg-clip-text text-2xl font-bold leading-tight tracking-tight text-transparent md:text-3xl lg:text-4xl">
                {heroContent.title}
              </h1>
              {heroContent.second_title && <h2 className="text-lg md:text-xl lg:text-2xl mt-2 text-purple-100/80 font-normal">{heroContent.second_title}</h2>}
            </div>
          </div>

          {/* Two-column layout for description and search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <p className="text-base leading-relaxed text-white/90 md:text-lg">{heroContent.description}</p>
            </div>

            <div className="md:col-span-1">
              {/* Use custom symbol search component */}
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-xl">
                <p className="text-sm text-white/80 mb-3 font-medium">Find dream symbols:</p>
                <SymbolsSearch placeholder={`Search ${categoryInfo.name} symbols...`} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb navigation */}
      <div className="container mx-auto px-4 my-8">
        <div className="py-3 relative">
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-purple-200 to-transparent dark:via-purple-800/30"></div>
          <Breadcrumb>
            <BreadcrumbList className="py-1 px-1 text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center gap-1.5 font-medium text-gray-600 hover:text-purple-600 transition-colors dark:text-gray-400 dark:hover:text-purple-400">
                  <HomeIcon className="h-3.5 w-3.5 text-purple-500/70 dark:text-purple-400/70" />
                  <span>Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-400 dark:text-gray-600" />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dream-dictionary"
                  className="flex items-center gap-1.5 font-medium text-gray-600 hover:text-purple-600 transition-colors dark:text-gray-400 dark:hover:text-purple-400"
                >
                  <TagIcon className="h-3.5 w-3.5 text-purple-500/70 dark:text-purple-400/70" />
                  <span>Dream Dictionary</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-400 dark:text-gray-600" />
              <BreadcrumbItem>
                <BreadcrumbLink className="flex items-center gap-1.5 font-medium text-purple-600 dark:text-purple-400">
                  <span>{categoryInfo.name}</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left category list */}
          <div className="lg:w-1/4">
            <CategorySidebar currentCategory={category} />
          </div>

          {/* Right content area */}
          <div className="lg:w-3/4">
            {/* Popular symbols for this category */}
            <section className="mb-16">
              <h2 className="mb-6 relative inline-block text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600 dark:from-purple-400 dark:to-indigo-300 pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-1/2 after:h-1 after:bg-gradient-to-r after:from-purple-500 after:to-indigo-500 after:rounded-full">
                Popular {categoryInfo.name} Dream Symbols
              </h2>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {categoryPopularSymbols.length > 0
                  ? categoryPopularSymbols.map(symbol => (
                      <Link href={`/dream-dictionary/${symbol.code}`} key={symbol.code}>
                        <Card className="group h-full overflow-hidden bg-white/90 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg dark:bg-gray-900/90 hover:shadow-purple-200/30 dark:hover:shadow-purple-900/30 border-0">
                          <div className="aspect-square overflow-hidden relative">
                            <img
                              src={symbol.img || '/images/placeholders/dream-symbol.jpg'}
                              alt={symbol.name}
                              className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <CardHeader className="p-3 group-hover:bg-gradient-to-r group-hover:from-purple-50 group-hover:to-indigo-50 dark:group-hover:from-purple-900/20 dark:group-hover:to-indigo-900/20 transition-colors duration-300">
                            <CardTitle className="text-center text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                              {symbol.name}
                            </CardTitle>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))
                  : // If no data, show placeholders
                    Array.from({ length: 6 }).map((_, index) => (
                      <Card key={index} className="h-full overflow-hidden bg-white/90 dark:bg-gray-900/90 border-0">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-800"></div>
                        <CardHeader className="p-3">
                          <CardTitle className="text-center text-sm font-medium text-gray-400 dark:text-gray-500">No Data</CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
              </div>

              {!hasSymbols && (
                <div className="mt-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No dream symbols found for this category. Try exploring other categories or use the search above.</p>
                </div>
              )}
            </section>

            {/* 使用SymbolsAlphabetList组件展示按字母排列的符号 */}
            <div className="mb-16">
              <SymbolsAlphabetList symbols={allCategorySymbols} categoryName={categoryInfo.name} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
