import { BlogStatus, findBlogBySlug } from '@/models/blog';

import BlogDetail from '@/components/blocks/blog-detail';
import TableOfContents from '@/components/blocks/blog-detail/toc';
import Empty from '@/components/blocks/empty';
import Header from '@/components/blocks/header';

export const runtime = "edge";

export async function generateMetadata(props: { params: Promise<{ locale: string; slug: string }> }) {
  const params = await props.params;

  const post = await findBlogBySlug(params.slug, params.locale);

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/blogs/${params.slug}`;

  return {
    title: post?.title,
    description: post?.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function Page(props: { params: Promise<{ locale: string; slug: string }> }) {
  const params = await props.params;
  const blog = await findBlogBySlug(params.slug, params.locale);
  if (!blog || blog.status !== BlogStatus.Online) {
    return <Empty message="Blog not found" />;
  }

  return (
    <div className="relative pt-12">
      <Header />
      {/* 梦幻渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-100 via-white to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

      {/* 装饰性模糊圆形 */}
      <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-indigo-100/50 dark:bg-indigo-500/10 blur-3xl" />
      <div className="absolute -right-20 -bottom-20 h-[500px] w-[500px] rounded-full bg-pink-100/50 dark:bg-pink-500/10 blur-3xl" />

      <div className="relative">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              <BlogDetail blog={blog} />
            </div>
            <div className="space-y-8">
              <div className="sticky top-36">
                <nav className="max-h-[calc(100vh-6rem)] overflow-y-auto">
                  <TableOfContents />
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
