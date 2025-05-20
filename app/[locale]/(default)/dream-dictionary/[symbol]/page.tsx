import Comments from '@/components/blocks/comments';
import Header from '@/components/blocks/header';
import SymbolsSearch from '@/components/blocks/symbols-search';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { MarkdownDisplay } from '@/components/ui/markdown-display';
import { TagList } from '@/components/ui/tag-list';
import { capitalize } from '@/lib/utils';
import { findItemConfigByCode, findItemConfigsByTags, findLatestItemConfigsByCategory } from '@/models/item-config';
import { SymbolInterpretation } from '@/types/pages/interpretation';
import { ChevronRight, Home as HomeIcon, LightbulbIcon, MessageCircleHeart, SunMoon, Tag as TagIcon } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }) {
  const locale = await getLocale();
  const { symbol } = await params;
  const itemConfig = await findItemConfigByCode(symbol, locale);
  const symbolData = itemConfig?.page_config as SymbolInterpretation;
  return {
    title: `${capitalize(symbol)} Dreams: Meaning & Interpretation | AI Dream Scope`,
    description: symbolData.meta.description,
  };
}

export default async function SymbolPage({ params }: { params: Promise<{ symbol: string }> }) {
  const locale = await getLocale();
  const { symbol } = await params;
  const itemConfig = await findItemConfigByCode(symbol, locale);
  const symbolData = itemConfig?.page_config as SymbolInterpretation;

  if (!symbolData) {
    notFound();
  }

  // 获取相关符号
  let relatedSymbols = (await findItemConfigsByTags(symbolData.symbolIntro.meaningPills?.map(pill => pill.text) || [], locale)).filter(item => item.code !== symbol);

  // 如果相关符号不足3个，使用同分类的最新符号补充
  let categorySymbols: typeof relatedSymbols = [];
  if (relatedSymbols.length < 3 && itemConfig?.category) {
    const latestInCategory = await findLatestItemConfigsByCategory(itemConfig.category, locale, 4);
    // 筛选掉当前符号和已有的相关符号
    const filteredCategorySymbols = latestInCategory.filter(item => item.code !== symbol && !relatedSymbols.some(related => related.code === item.code));

    // 补充直到总数为3
    categorySymbols = filteredCategorySymbols.slice(0, 3 - relatedSymbols.length);
  } else {
    relatedSymbols = relatedSymbols.slice(0, 3);
  }
  // 合并相关符号和分类最新符号
  const combinedRelatedSymbols = [...relatedSymbols, ...categorySymbols];

  return (
    <>
      <div className="min-h-screen">
        {/* 顶部横幅 */}
        <div className="relative mb-6 md:mb-12 bg-gradient-to-r from-purple-900/90 via-indigo-800/90 to-blue-900/90  text-white shadow-xl pb-12">
          <Header />

          {/* 背景装饰 */}
          <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-purple-500/30 blur-3xl"></div>
          <div className="absolute -right-32 -bottom-32 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl"></div>
          <div className="absolute left-1/2 top-1/4 h-40 w-40 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-2xl"></div>

          <div className="container relative z-10 mx-auto px-4 pt-8 lg:pt-24">
            <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-12">
              {/* 文本内容区域 */}
              <div className="w-full lg:w-3/5">
                <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl capitalize">
                  {symbolData.symbolIntro.symbolName}
                  <span className="mt-2 block text-lg font-normal tracking-normal text-white/80 md:mt-3">{symbolData.symbolIntro.title.replaceAll(symbolData.symbolIntro.symbolName + ':', '')}</span>
                </h1>
                <p className="mb-6 text-base leading-relaxed text-white/90 md:text-lg lg:text-xl">{symbolData.symbolIntro.quickMeaning}</p>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {symbolData.symbolIntro.meaningPills?.map((pill, index) => (
                    <span key={index} className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-sm backdrop-blur-md transition-all hover:bg-white/20">
                      {pill.text}
                    </span>
                  ))}
                </div>
                {/* 使用自定义的符号搜索组件 */}
                <div className="mt-4">
                  <SymbolsSearch placeholder="Search dream symbols..." />
                </div>
              </div>

              {/* 图片区域 - 仅在图片存在时显示 */}
              {itemConfig?.img && (
                <div className="mt-8 flex w-full justify-center lg:mt-0 lg:w-2/5 lg:justify-end">
                  <div className="relative h-60 w-60 overflow-hidden rounded-2xl shadow-2xl sm:h-72 sm:w-72 md:h-80 md:w-80">
                    <Image src={itemConfig.img} alt={symbolData.symbolIntro.symbolName} fill className="object-cover" sizes="(max-width: 640px) 240px, (max-width: 768px) 288px, 320px" />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {/* 面包屑导航 */}
          <div className="mb-8 animate-fade-in pb-3 relative" style={{ '--animation-delay': '300ms' } as React.CSSProperties}>
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
            <Breadcrumb>
              <BreadcrumbList className="py-1 px-1 text-sm">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center gap-1.5 font-medium text-gray-600 hover:text-purple-600 transition-colors ">
                    <HomeIcon className="h-3.5 w-3.5 text-purple-500/70" />
                    <span>Home</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-400 " />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={`/dream-dictionary-category/${itemConfig?.category?.toLowerCase().replaceAll(' ', '-')}`}
                    className="flex items-center gap-1.5 font-medium text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    <TagIcon className="h-3.5 w-3.5 text-purple-500/70 " />
                    <span>{itemConfig?.category}</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-400 " />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-semibold">
                    <span>{symbolData.symbolIntro.symbolName}</span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* 主内容和侧边栏的flex容器 */}
          <div className="flex flex-col lg:flex-row lg:gap-8">
            {/* 主内容区域 */}
            <div className="w-full lg:w-2/3">
              {/* 解析内容 */}
              <section className="mb-10 transform transition-all hover:translate-y-[-2px]" id="interpretation">
                <div className="relative overflow-hidden rounded-2xl bg-white/80 p-4 md:p-8 shadow-lg  backdrop-blur-xl ring-1 ring-indigo-100 ">
                  <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl"></div>
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl"></div>

                  <h2 className="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent ">{symbolData.interpretation.title}</h2>

                  <div className="mb-8 text-gray-700 leading-relaxed ">
                    <MarkdownDisplay content={symbolData.interpretation.description} />
                  </div>

                  {/* AI Analysis CTA */}
                  <div className="mt-8 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600/10 to-indigo-600/10 p-8 backdrop-blur-sm ring-1 ring-purple-200/30 dark:from-purple-600/20 dark:to-indigo-600/20 dark:ring-purple-800/30">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                      {/* Left side with icon */}
                      <div className="flex-shrink-0">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-3 shadow-lg">
                          <SunMoon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      {/* Right side with content */}
                      <div className="flex-grow text-center md:text-left">
                        <h3 className="mb-2 text-xl font-semibold text-indigo-900 ">Want a Personalized Dream Analysis?</h3>
                        <p className="mb-4 text-gray-700 ">Get personalized insights about your dreams using our advanced AI analysis tool.</p>
                        <a
                          href="/dream-interpreter"
                          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                        >
                          Try Free AI Dream Interpreter
                          <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl bg-indigo-50/70 p-6 shadow-inner backdrop-blur-sm ring-1 ring-indigo-100/40 dark:bg-indigo-950/30 dark:ring-indigo-800/20">
                    <h3 className="mb-4 text-xl font-semibold text-indigo-800 dark:text-indigo-300">{symbolData.interpretation.commonScenarios.title}</h3>
                    <MarkdownDisplay content={symbolData.interpretation.commonScenarios.content} className="text-gray-700 leading-relaxed dark:text-gray-300" />
                  </div>
                </div>
              </section>

              {/* 个人指导 */}
              <section className="mb-10 transform transition-all hover:translate-y-[-2px]" id="personal-guide">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50/90 to-indigo-50/90 p-4 md:p-8 shadow-lg  backdrop-blur-xl ring-1 ring-purple-100 dark:from-purple-950/80 dark:to-indigo-950/80 dark:ring-purple-800/30">
                  <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl"></div>
                  <div className="absolute -left-16 -bottom-16 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

                  <h2 className="relative mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-purple-400 dark:to-indigo-400">
                    {symbolData.personalGuide.title}
                  </h2>

                  <MarkdownDisplay content={symbolData.personalGuide.description} className="mb-6 text-gray-700 leading-relaxed dark:text-gray-300" />

                  {symbolData.personalGuide.steps && (
                    <div className="relative space-y-6">
                      {symbolData.personalGuide.steps.map((step, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex-shrink-0 pt-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md dark:from-purple-600 dark:to-indigo-700">
                              <span className="text-lg font-semibold">{index + 1}</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="mb-2 text-lg font-semibold text-indigo-700 dark:text-indigo-300">{step.title}</h3>
                            <p className="text-gray-700 leading-relaxed dark:text-gray-300">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {symbolData.personalGuide.questions && (
                    <div className="mt-8 rounded-xl bg-indigo-50/70 p-6 shadow-inner backdrop-blur-sm ring-1 ring-indigo-100/40 dark:bg-indigo-950/30 dark:ring-indigo-800/20">
                      <h3 className="mb-4 flex items-center text-lg font-semibold text-indigo-800 dark:text-indigo-300">
                        <LightbulbIcon className="mr-2 inline-block h-5 w-5 text-amber-500" />
                        Ask Yourself
                      </h3>
                      <ul className="space-y-3">
                        {symbolData.personalGuide.questions.map((question, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <ChevronRight className="mt-1 h-4 w-4 text-purple-500" />
                            <span className="text-gray-700 leading-relaxed dark:text-gray-300">{question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>

              {/* 梦境解析示例 */}
              <section className="mb-10 transform transition-all hover:translate-y-[-2px]" id="dream-examples">
                <div className="relative overflow-hidden rounded-2xl bg-white/80 p-4 md:p-8 shadow-lg  backdrop-blur-xl ring-1 ring-indigo-100 dark:bg-gray-900/80 dark:ring-indigo-800/30">
                  <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl"></div>
                  <div className="absolute -left-16 top-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl"></div>

                  {/* 标题区域 */}
                  <div className="relative mb-6 flex items-center">
                    <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M9 12L10.5 13.5L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h2 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-indigo-400 dark:to-purple-400">
                      {symbolData.dreamInterpretationExamples.title}
                    </h2>
                  </div>

                  <p className="mb-8 text-gray-700 leading-relaxed dark:text-gray-300">{symbolData.dreamInterpretationExamples.description}</p>

                  <div className="space-y-6">
                    {symbolData.dreamInterpretationExamples.examples?.map((example, index) => (
                      <div
                        key={index}
                        className="group relative rounded-xl bg-white/60 p-6 shadow-sm transition-all hover:bg-indigo-50/60 hover:shadow-md dark:bg-gray-800/40 dark:hover:bg-indigo-900/30 overflow-hidden"
                      >
                        {/* 装饰元素 */}
                        <div className="absolute -right-8 -bottom-8 h-16 w-16 rounded-full bg-indigo-300/10 blur-xl transition-all group-hover:bg-indigo-400/20"></div>

                        {/* 左侧紫色指示器 */}
                        <div className="flex gap-5">
                          <div className="flex-shrink-0 mt-1.5">
                            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600"></div>
                          </div>

                          <div className="flex-grow">
                            <h3 className="mb-3 text-lg font-medium text-indigo-700 dark:text-indigo-300">{example.scenario}</h3>
                            <div className="relative ml-1 pl-6 border-l-2 border-indigo-100 dark:border-indigo-800/50">
                              <p className="text-gray-700 leading-relaxed dark:text-gray-300">{example.analysis}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* AI个性化解析区 - 修改ID以避免URL冲突 */}
              <section className="mb-10 transform transition-all hover:translate-y-[-2px]" id="dream-ai-analysis">
                {/* <DreamChat /> */}
              </section>

              {/* FAQ区域 */}
              <section className="mb-10 transform transition-all hover:translate-y-[-2px]" id="faqs">
                <div className="relative overflow-hidden rounded-2xl bg-white/80 p-4 md:p-8 shadow-lg  backdrop-blur-xl ring-1 ring-indigo-100 dark:bg-gray-900/80 dark:ring-indigo-800/30">
                  <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl"></div>
                  <div className="absolute right-16 bottom-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl"></div>

                  {/* 标题区域 */}
                  <div className="relative mb-8 flex items-center">
                    <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M8.22766 9C8.77678 7.83481 10.2584 7 12.0001 7C14.2092 7 16.0001 8.34315 16.0001 10C16.0001 11.3994 14.7224 12.5751 12.9943 12.9066C12.4519 13.0106 12.0001 13.4477 12.0001 14M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h2 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-indigo-400 dark:to-purple-400">
                      {symbolData.faq.title}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {symbolData.faq.items?.map((faq, index) => (
                      <div
                        key={index}
                        className="group rounded-xl border border-indigo-100/40 bg-white/60 p-6 transition-all hover:border-indigo-200/60 hover:bg-indigo-50/40 dark:border-indigo-800/30 dark:bg-gray-800/40 dark:hover:border-indigo-700/40 dark:hover:bg-indigo-900/20"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 pt-1">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 transition-colors group-hover:bg-indigo-200 group-hover:text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 dark:group-hover:bg-indigo-800 dark:group-hover:text-indigo-200">
                              <span className="text-base font-medium">Q</span>
                            </div>
                          </div>
                          <div className="flex-grow">
                            <h3 className="mb-3 text-lg font-medium text-indigo-700 dark:text-indigo-300">{faq.question}</h3>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 pt-1">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-700 transition-colors group-hover:bg-purple-200 group-hover:text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 dark:group-hover:bg-purple-800 dark:group-hover:text-purple-200">
                                  <span className="text-base font-medium">A</span>
                                </div>
                              </div>
                              <p className="flex-grow text-gray-700 leading-relaxed dark:text-gray-300">{faq.answer}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 相关建议 */}
              {symbolData.suggestions && (
                <section className="mb-12 lg:mb-6 transform transition-all hover:translate-y-[-2px]" id="suggestions">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-100/90 via-purple-50/90 to-indigo-50/90 p-10 shadow-lg backdrop-blur-xl ring-1 ring-indigo-200 dark:from-indigo-950/80 dark:via-purple-950/80 dark:to-indigo-950/80 dark:ring-indigo-800/30">
                    {/* 装饰元素 */}
                    <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl"></div>
                    <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>
                    <div className="absolute right-1/3 top-1/2 h-16 w-16 rounded-full bg-pink-500/10 blur-xl"></div>

                    {/* 标题区 */}
                    <div className="relative mb-8 flex items-center">
                      <div className="mr-5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                        <MessageCircleHeart className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-indigo-400 dark:to-purple-400">
                        {symbolData.suggestions.title || 'Related Suggestions'}
                      </h2>
                    </div>

                    {/* 内容区 */}
                    <div className="rounded-xl bg-white/70 p-8 shadow-inner backdrop-blur-sm ring-1 ring-indigo-100/60 dark:bg-gray-900/30 dark:ring-indigo-800/20">
                      <p className="text-gray-700 leading-relaxed dark:text-gray-300 text-base md:text-lg">{symbolData.suggestions.content}</p>

                      {/* 行动按钮 */}
                      <div className="mt-8 flex flex-wrap gap-5">
                        <a
                          href="#interpretation"
                          className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-center text-sm font-medium text-white shadow-md transition-all hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800"
                        >
                          <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                          </svg>
                          Read Interpretation
                        </a>
                        <a
                          href="/dream-interpreter"
                          className="inline-flex items-center rounded-lg border border-indigo-300 bg-white/70 px-6 py-3 text-center text-sm font-medium text-indigo-700 shadow-sm transition-all hover:bg-indigo-100/80 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:border-indigo-800 dark:bg-gray-900/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50 dark:focus:ring-indigo-800"
                        >
                          Try AI Analysis
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 将评论组件移动到主内容区域内并设置成卡片样式 */}
              <div className="mt-10 transform transition-all hover:translate-y-[-2px]">
                <div className="relative overflow-hidden rounded-2xl bg-white/80 p-4 md:p-8 shadow-lg  backdrop-blur-xl ring-1 ring-indigo-100 dark:bg-gray-900/80 dark:ring-indigo-800/30">
                  <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl"></div>
                  <div className="absolute right-16 bottom-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl"></div>

                  {/* 标题区 */}
                  <div className="relative mb-6 flex items-center">
                    <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5 20 9.06 19.7 7.8 19.16L3 20L4.3 16.1C3.5 14.9 3 13.5 3 12C3 7.582 7.03 4 12 4C16.97 4 21 7.582 21 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h2 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-indigo-400 dark:to-purple-400">
                      Join the Discussion
                    </h2>
                  </div>

                  <Comments source_code={itemConfig?.code} />
                </div>
              </div>
            </div>

            {/* 右侧边栏 */}
            <aside className="w-full mt-8 lg:mt-0 lg:w-1/3 block">
              {/* 相关符号 */}
              {combinedRelatedSymbols.length > 0 && (
                <div className="mb-8 rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-xl ring-1 ring-indigo-100 dark:bg-gray-900/80 dark:ring-indigo-800/30">
                  <div className="relative">
                    <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl"></div>

                    <h2 className="mb-5 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-indigo-400 dark:to-purple-400">
                      Related Symbols
                    </h2>

                    <div className="space-y-4">
                      {combinedRelatedSymbols.map(symbol => (
                        <Link
                          key={symbol.id}
                          href={`/dream-dictionary/${symbol.code}`}
                          className="block p-4 rounded-lg border border-indigo-100/40 bg-white/60 hover:border-purple-300 hover:bg-purple-50/50 transition-all dark:bg-gray-900/40 dark:border-indigo-800/30 dark:hover:border-purple-700 dark:hover:bg-purple-900/20"
                        >
                          <div className="flex flex-col gap-2">
                            <h3 className="font-medium text-indigo-700 dark:text-indigo-300">{symbol.name}</h3>
                            {symbol.description && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{symbol.description}</p>}
                            <TagList tags={symbol.tags} />
                          </div>
                        </Link>
                      ))}
                      {combinedRelatedSymbols.length === 0 && <div className="text-center py-4 text-gray-500 dark:text-gray-400">No related symbols found</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* 导航栏 */}
              <div className="rounded-xl sticky top-12 bg-white/85 p-6 shadow-lg backdrop-blur-xl ring-1 ring-indigo-100 dark:bg-gray-900/85 dark:ring-indigo-800/30">
                <div className="relative">
                  <div className="absolute -left-16 bottom-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl"></div>

                  <h2 className="mb-5 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-indigo-400 dark:to-purple-400">
                    Quick Navigation
                  </h2>

                  <nav className="space-y-3">
                    <a
                      href="#interpretation"
                      className="flex items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-indigo-50/70 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path d="M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="font-medium">Dream Interpretation</span>
                    </a>

                    <a
                      href="#personal-guide"
                      className="flex items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-indigo-50/70 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="font-medium">Personal Guide</span>
                    </a>

                    <a
                      href="#dream-examples"
                      className="flex items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-indigo-50/70 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path d="M9 12L10.5 13.5L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="font-medium">Dream Examples</span>
                    </a>

                    <a
                      href="#dream-ai-analysis"
                      className="flex items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-indigo-50/70 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M9.5 6C9.5 5.17157 10.1716 4.5 11 4.5H13C13.8284 4.5 14.5 5.17157 14.5 6V8C14.5 8.82843 13.8284 9.5 13 9.5H11C10.1716 9.5 9.5 8.82843 9.5 8V6Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3.5 18V16C3.5 15.1716 4.17157 14.5 5 14.5H8C8.82843 14.5 9.5 15.1716 9.5 16V18C9.5 18.8284 8.82843 19.5 8 19.5H5C4.17157 19.5 3.5 18.8284 3.5 18Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14.5 18V16C14.5 15.1716 15.1716 14.5 16 14.5H19C19.8284 14.5 20.5 15.1716 20.5 16V18C20.5 18.8284 19.8284 19.5 19 19.5H16C15.1716 19.5 14.5 18.8284 14.5 18Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6.75 14.5V12C6.75 11.5858 7.08579 11.25 7.5 11.25H16.5C16.9142 11.25 17.25 11.5858 17.25 12V14.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path d="M12 9.5V11.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="font-medium">AI Personalized Analysis</span>
                    </a>

                    <a
                      href="#faqs"
                      className="flex items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-indigo-50/70 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M8.22766 9C8.77678 7.83481 10.2584 7 12.0001 7C14.2092 7 16.0001 8.34315 16.0001 10C16.0001 11.3994 14.7224 12.5751 12.9943 12.9066C12.4519 13.0106 12.0001 13.4477 12.0001 14M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="font-medium">FAQs</span>
                    </a>

                    <a
                      href="#suggestions"
                      className="flex items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-indigo-50/70 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
                        <MessageCircleHeart className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">Related Suggestions</span>
                    </a>
                  </nav>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
