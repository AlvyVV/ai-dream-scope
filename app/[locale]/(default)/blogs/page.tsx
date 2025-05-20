import Header from '@/components/blocks/header';
import { getBlogsByLocale } from '@/models/blog';
import { Blog as BlogType } from '@/types/blocks/blog';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale;
  const t = await getTranslations();

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/blogs`;

  if (locale !== 'en') {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/blogs`;
  }

  return {
    title: 'Dream Interpretation Blog: Expert Insights & Analysis | AI Dream Scope',
    description:
      'Explore blog for expert insights, symbol analysis, and psychological perspectives. Learn how to decode your dreams with our guides, case studies, and latest dream research. Enhance your dream interpretation skills.',
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const t = await getTranslations();

  const blogs = await getBlogsByLocale(params.locale);

  const blog: BlogType = {
    title: t('blog.title'),
    description: t('blog.description'),
    items: blogs,
    read_more_text: t('blog.read_more_text'),
  };

  return (
    <>
      <div className="relative overflow-hidden">
        {/* 梦幻渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950" />

        {/* 装饰性模糊圆形 */}
        <div className="absolute -left-32 -top-32 h-80 w-80 animate-pulse-slow rounded-full bg-purple-500/30 blur-3xl"></div>
        <div className="absolute -right-32 -bottom-32 h-80 w-80 animate-pulse-slow animation-delay-2000 rounded-full bg-blue-500/30 blur-3xl"></div>
        <div className="absolute left-1/2 top-1/3 h-64 w-64 animate-pulse-slow animation-delay-1000 rounded-full bg-indigo-500/20 blur-3xl"></div>

        <Header />

        {/* Hero Section */}
        <section className="relative py-20 sm:py-24 lg:py-28">
          <div className="container">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <h1 className="mb-6 text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                <span className="text-slate-800 dark:text-slate-200">Dreamscape Insights: </span>
                <span className="text-primary/80 relative inline-block">
                  Unveiling Your Subconscious
                  <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></span>
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-3xl leading-relaxed">
                Explore our collection of articles where dream experts reveal hidden meanings, share practical techniques, and connect ancient symbolism with modern psychology. Enhance your
                understanding of dreams and apply their wisdom to your daily life.{' '}
              </p>
            </div>
          </div>
        </section>

        {/* Blog Grid Section */}
        <section className="relative pb-24 md:pb-32">
          <div className="container">
            <div className="grid w-full gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {blog.items?.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url || `/blogs/${item.slug}`}
                  target={item.target || '_self'}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 duration-300"
                >
                  {item.cover_url && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img src={item.cover_url} alt={item.title || ''} className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-70" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-3 text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-200 group-hover:text-primary">{item.title}</h3>
                    {item.description && <p className="mb-4 flex-1 text-muted-foreground line-clamp-3">{item.description}</p>}
                    {blog.read_more_text && (
                      <div className="pt-4 border-t border-border/50">
                        <p className="inline-flex items-center text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
                          {blog.read_more_text}
                          <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </p>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>

            {/* 辅助导航功能 */}
            {/* <div className="mt-16 flex justify-center">
              <div className="inline-flex rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-1 shadow-md">
                <button className="px-4 py-2 rounded-md bg-primary text-white font-medium shadow-sm">1</button>
                <button className="px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">2</button>
                <button className="px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">3</button>
                <button className="px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div> */}
          </div>
        </section>
      </div>
    </>
  );
}
