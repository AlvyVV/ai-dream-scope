import Footer from '@/components/blocks/footer';
import MobileHeader from '@/components/blocks/mobile-header';
import { getLocale } from 'next-intl/server';
import { ReactNode } from 'react';

export default async function DefaultLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <>
      <MobileHeader />
      <main className="flex-1 bg-[#fff9f3] pb-4 md:pb-16">{children}</main>
      <Footer></Footer>
    </>
  );
}
