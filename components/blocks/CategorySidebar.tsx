import { listPageConfigsByCategory } from '@/models/item-config';
import { SparklesIcon } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';

export type CategoryItem = {
  category: string;
  count?: number;
};

export default async function CategorySidebar({ currentCategory }: { currentCategory?: string }) {
  const locale = await getLocale();
  // Get all category information for the sidebar
  const categoryList = await listPageConfigsByCategory();
  const title = 'Browse Categories';

  return (
    <div className="sticky top-16 rounded-xl bg-white/90 p-5 shadow-md backdrop-blur-md dark:bg-gray-900/90 border border-purple-100 dark:border-purple-900/30">
      <h2 className="mb-4 text-xl font-bold relative pl-7 text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600 dark:from-purple-400 dark:to-indigo-300">
        <span className="absolute left-0 top-1">
          <SparklesIcon className="h-5 w-5 text-purple-500" />
        </span>
        {title}
      </h2>
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-2">
        {categoryList.map(cat => (
          <Link
            href={`/dream-dictionary-category/${cat.category.toLowerCase().replace(/ /g, '-')}`}
            key={cat.category}
            className={`flex items-center justify-between rounded-lg border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md text-xs p-2 lg:text-sm lg:p-3 ${
              currentCategory && currentCategory.toLowerCase() === cat.category.toLowerCase()
                ? 'border-purple-300 bg-purple-50/80 text-purple-700 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/80 hover:text-purple-700 dark:border-gray-700 dark:bg-gray-800/80 dark:hover:border-purple-800 dark:hover:bg-purple-900/20 dark:hover:text-purple-400'
            }`}
          >
            <span className="font-medium truncate">{cat.category}</span>
            <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-700 dark:text-gray-300 lg:px-2">{cat.count || 0}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
