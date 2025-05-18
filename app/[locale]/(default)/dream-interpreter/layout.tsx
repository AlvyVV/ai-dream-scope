import { getLandingPage } from '@/services/page';
import { getLocale } from 'next-intl/server';
import { ReactNode } from 'react';
export default async function DefaultLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const page = await getLandingPage('landing', locale);

  return (
    <>
      <main>{children}</main>
    </>
  );
}
