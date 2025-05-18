import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

import { Blog } from '@/types/blog';
import { Home } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Crumb({ blog }: { blog: Blog }) {
  const t = useTranslations();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={blog.locale === 'en' ? '/' : `/${blog.locale}`}>
            <Home className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={blog.locale === 'en' ? '/blogs' : `/${blog.locale}/blogs`}>{t('blog.title')}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{blog.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
