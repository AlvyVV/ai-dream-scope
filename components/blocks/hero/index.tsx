'use client';

import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hero as HeroType } from '@/types/blocks/hero';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

// 使用动态导入延迟加载DreamBox组件
const DreamBox = dynamic(() => import('../deream-box'), {
  loading: () => (
    <div className="h-[500px] w-full bg-background/80 backdrop-blur-sm shadow-lg rounded-lg flex items-center justify-center">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-slate-200 h-24 w-24"></div>
      </div>
    </div>
  ),
  ssr: false, // 禁用服务器端渲染，减少初始HTML大小
});

// 同样动态导入HappyUsers组件
const HappyUsers = dynamic(() => import('./happy-users'), {
  ssr: true, // 保持服务器端渲染以避免布局偏移
});

export default function Hero({ hero }: { hero: HeroType }) {
  if (hero.disabled) {
    return null;
  }

  const highlightText = hero.highlight_text;
  let texts = null;
  if (highlightText) {
    texts = hero.title?.split(highlightText, 2);
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br" />
      <section className="relative py-12 md:py-24">
        <div className="container">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
            {/* 左侧内容区 */}
            <div className="flex-1 lg:max-w-[60%] text-left">
              {hero.show_badge && (
                <div className="flex mb-8">
                  <div className="rounded-full bg-white/90 dark:bg-gray-800/90 px-4 py-2 shadow-lg backdrop-blur-sm">
                    <Image src="/imgs/badges/phdaily.svg" alt="phdaily" width={100} height={40} className="h-8 sm:h-10 w-auto" priority />
                  </div>
                </div>
              )}

              {hero.announcement && (
                <a
                  href={hero.announcement.url}
                  className="mb-10 inline-flex items-center gap-3 rounded-full bg-white/80 dark:bg-gray-800/80 px-4 py-2 text-sm shadow-lg backdrop-blur-sm transition-all hover:bg-white/90 dark:hover:bg-gray-800/90"
                >
                  {hero.announcement.label && <Badge className="bg-primary/90 text-white">{hero.announcement.label}</Badge>}
                  {hero.announcement.title}
                </a>
              )}

              {texts && texts.length > 1 ? (
                <h1 className="mb-6 sm:mb-8 text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  <span className="text-slate-800 dark:text-slate-200">{texts[0]}</span>
                  <span className="text-primary/80 relative inline-block">
                    {highlightText}
                    <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></span>
                  </span>
                  <span className="text-slate-800 dark:text-slate-200">{texts[1]}</span>
                </h1>
              ) : (
                <h1 className="mb-6 sm:mb-8 text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  <span className="text-slate-800 dark:text-slate-200">{hero.title}</span>
                </h1>
              )}

              <h2 className="mb-6 sm:mb-8 text-xl sm:text-2xl font-medium tracking-tighter text-slate-600/90 dark:text-slate-400">{hero.second_title}</h2>

              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed mb-8 sm:mb-10">{hero.description}</p>

              {hero.buttons && (
                <div className="mt-8 sm:mt-12 flex flex-wrap gap-3 sm:gap-4">
                  {hero.buttons.map((item, i) => {
                    return (
                      <Link key={i} href={item.url || ''} target={item.target || ''} className="flex items-center">
                        <Button
                          className={`shadow-lg transition-all hover:shadow-xl ${item.variant === 'default' ? 'bg-primary hover:bg-white hover:text-primary hover:border-primary hover:border' : ''}`}
                          size="lg"
                          variant={item.variant || 'default'}
                        >
                          {item.title}
                          {item.icon && <Icon name={item.icon} className="ml-2" />}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}

              {hero.tip && <p className="mt-8 text-sm text-gray-600 md:block hidden">{hero.tip}</p>}
            </div>

            {/* 右侧梦境解析器 - 使用Suspense包裹 */}
            <div className="mt-8 md:mt-16 lg:mt-0 lg:w-[40%]">
              <Suspense
                fallback={
                  <div className="h-[500px] w-full bg-background/80 backdrop-blur-sm shadow-lg rounded-lg flex items-center justify-center">
                    <div className="animate-pulse flex space-x-4">
                      <div className="rounded-full bg-slate-200 h-24 w-24"></div>
                    </div>
                  </div>
                }
              >
                <DreamBox />
              </Suspense>
              {hero.show_happy_users && (
                <div className="mt-4 md:mt-8">
                  <HappyUsers />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
