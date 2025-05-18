'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // 获取所有标题元素，排除 h1
    const elements = Array.from(document.querySelectorAll('h2, h3, h4, h5, h6'));

    // 为每个标题生成唯一ID
    elements.forEach(element => {
      if (!element.id) {
        const id =
          element.textContent
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || `heading-${Math.random().toString(36).substr(2, 9)}`;
        element.id = id;
      }
    });

    // 转换为TocItem数组
    const items = elements.map(element => ({
      id: element.id,
      text: element.textContent || '',
      level: parseInt(element.tagName[1]),
    }));

    setHeadings(items);

    // 监听滚动事件，更新当前激活的标题
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    elements.forEach(element => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="relative">
      <nav className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <div className="rounded-xl border bg-card/80 p-6 backdrop-blur-sm shadow-sm">
          <h2 className="mb-6 text-base font-medium text-foreground">Menus</h2>
          <ul className="space-y-1">
            {headings.map(heading => (
              <li
                key={heading.id}
                style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
                className={cn('group relative flex items-center transition-all duration-200', 'hover:text-primary/90', activeId === heading.id && 'text-primary font-medium')}
              >
                <div className={cn('absolute left-0 top-0 h-full w-1 transition-all duration-200', 'bg-primary/20 group-hover:bg-primary/40', activeId === heading.id && 'bg-primary')} />
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={cn('w-full py-1.5 pl-2 text-left text-sm transition-colors duration-200', 'hover:text-primary/90', activeId === heading.id && 'text-primary')}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
