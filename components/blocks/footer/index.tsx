import { getComponent } from '@/services/load-components';
import { Footer as FooterType } from '@/types/blocks/footer';
import { getLocale } from 'next-intl/server';
import FooterClient from './client';
export default async function Footer() {
  const locale = await getLocale();
  const footer = await getComponent<FooterType>(locale, 'footer');

  if (footer.disabled) {
    return null;
  }

  return <FooterClient footer={footer} />;
}
