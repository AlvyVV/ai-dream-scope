import ComingSoon from '@/components/blocks/coming-soon';
import FAQ from '@/components/blocks/faq';
import Feature from '@/components/blocks/feature';
import Feature1 from '@/components/blocks/feature1';
import Feature2 from '@/components/blocks/feature2';
import Feature3 from '@/components/blocks/feature3';
import Header from '@/components/blocks/header';
import Hero from '@/components/blocks/hero';
import Pricing from '@/components/blocks/pricing';
import Showcase from '@/components/blocks/showcase';
import Stats from '@/components/blocks/stats';
import Testimonial from '@/components/blocks/testimonial';
import { getPage } from '@/services/load-page';
import { LandingPage } from '@/types/pages/landing';
import { getLocale } from 'next-intl/server';

export const runtime = 'edge';

export async function generateMetadata() {
  const locale = await getLocale();
  const page = await getPage<LandingPage>(locale, 'home');

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}`;

  if (locale !== 'en') {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}`;
  }

  return {
    title: page.meta.title,
    description: page.meta.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function Page() {
  const locale = await getLocale();
  const page = await getPage<LandingPage>(locale, 'home');

  return (
    <>
      <div className="relative overflow-hidden mx-2 px-1 mt-2 md:mx-4 rounded-3xl">
        {/* 梦幻渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-100 to-[#b060ff] dark:from-gray-900 dark:via-indigo-900 dark:to-purple-950" />
        {page.header && <Header />}
        {page.hero && <Hero hero={page.hero} />}
      </div>
      {page.showcase && <Showcase section={page.showcase} />}
      {page.introduce && <Feature1 section={page.introduce} />}
      {page.testimonial && <Testimonial section={page.testimonial} />}
      {page.usage && <Feature3 section={page.usage} />}
      {page.benefit && <Feature2 section={page.benefit} />}
      {page.feature && <Feature section={page.feature} />}
      {page.stats && <Stats section={page.stats} />}
      {page.pricing && <Pricing pricing={page.pricing} />}
      {page.faq && <FAQ section={page.faq} />}
      <ComingSoon />
    </>
  );
}
