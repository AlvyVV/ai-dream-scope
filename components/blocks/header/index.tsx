import { getComponent } from '@/services/load-components';
import { Header as HeaderType } from '@/types/blocks/header';
import { getLocale } from 'next-intl/server';
import HeaderClient from './client';

export default async function Header() {
  const locale = await getLocale();
  const header = await getComponent<HeaderType>(locale, 'header');

  if (header.disabled) {
    return null;
  }

  return <HeaderClient header={header} />;
}
