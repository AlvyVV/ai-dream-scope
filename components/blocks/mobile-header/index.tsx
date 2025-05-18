import { getBlocks } from '@/services/page';
import { Header as HeaderType } from '@/types/blocks/header';
import { getLocale } from 'next-intl/server';
import MobileHeaderClient from './client';
export default async function Header() {
  const locale = await getLocale();
  const header = await getBlocks<HeaderType>('header', locale);

  if (header.disabled) {
    return null;
  }

  return <MobileHeaderClient header={header} />;
}
