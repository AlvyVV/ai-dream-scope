'use client';

import { TagList } from '@/components/ui/tag-list';
import { Link } from 'lucide-react';

export default function Symbols() {
  const relatedSymbols: any[] = [];

  return (
    <div className="sticky top-24 space-y-4">
      {/* 相关符号 */}
      <div className="mb-8 rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-xl ring-1 ring-indigo-100 dark:bg-gray-900/80 dark:ring-indigo-800/30">
        <div className="relative">
          <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl"></div>

          <h2 className="mb-5 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-indigo-400 dark:to-purple-400">
            Related Symbols
          </h2>

          <div className="space-y-4">
            {relatedSymbols.map((symbol: any) => (
              <Link
                key={symbol.id}
                href={`/dream-dictionary/${symbol.code}`}
                className="block p-4 rounded-lg border border-indigo-100/40 bg-white/60 hover:border-purple-300 hover:bg-purple-50/50 transition-all dark:bg-gray-900/40 dark:border-indigo-800/30 dark:hover:border-purple-700 dark:hover:bg-purple-900/20"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-indigo-700 dark:text-indigo-300">{symbol.name}</h3>
                  {symbol.description && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{symbol.description}</p>}
                  <TagList tags={symbol.tags} />
                </div>
              </Link>
            ))}
            {relatedSymbols.length === 0 && <div className="text-center py-4 text-gray-500 dark:text-gray-400">No related symbols found</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
