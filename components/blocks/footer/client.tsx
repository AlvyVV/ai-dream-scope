'use client';

import Icon from '@/components/icon';
import { localeNames } from '@/i18n/locale';
import { Footer as FooterType } from '@/types/blocks/footer';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';

export default function FooterClient({ footer }: { footer: FooterType }) {
  return (
    <section id={footer.name} className="py-8 bg-gradient-to-br from-purple-200 via-pink-100 to-purple-50 dark:from-purple-900/40 dark:via-pink-800/30 dark:to-blue-900/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-300/40 via-transparent to-transparent dark:from-purple-600/20 dark:via-transparent dark:to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-200/50 via-transparent to-transparent dark:from-pink-700/20 dark:via-transparent dark:to-transparent"></div>
      <div className="container  mx-auto px-8 relative z-10">
        <footer className="rounded-xl bg-white/50 backdrop-blur-sm shadow-sm dark:bg-gray-950/30 p-8 border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between gap-10 text-center lg:flex-row lg:text-left">
            <div className="flex w-full max-w-96 shrink flex-col items-center justify-between gap-6 lg:items-start">
              {footer.brand && (
                <div>
                  <div className="flex items-center justify-center gap-2 lg:justify-start">
                    {footer.brand.logo && <img src={footer.brand.logo.src} alt={footer.brand.logo.alt || footer.brand.title} className="h-11" />}
                    {footer.brand.title && <p className="text-3xl font-semibold">{footer.brand.title}</p>}
                  </div>
                  {footer.brand.description && <p className="mt-6 text-md text-gray-600 dark:text-gray-300">{footer.brand.description}</p>}
                </div>
              )}
              <a href="https://frogdr.com/aidreamscope.com?utm_source=aidreamscope.com" target="_blank">
                <img src="https://frogdr.com/aidreamscope.com/badge-white.svg" alt="Monitor your Domain Rating with FrogDR" width="250" height="54" />
              </a>
              <a href="https://dang.ai/" target="_blank">
                <img
                  src="https://cdn.prod.website-files.com/63d8afd87da01fb58ea3fbcb/6487e2868c6c8f93b4828827_dang-badge.png"
                  alt="Dang.ai"
                  style={{ width: '150px', height: '54px' }}
                  width="150"
                  height="54"
                />
              </a>
              {footer.social && (
                <ul className="flex items-center space-x-6 text-muted-foreground">
                  {footer.social.items?.map((item, i) => (
                    <li key={i} className="font-medium hover:text-primary">
                      <a href={item.url} target={item.target}>
                        {item.icon && <Icon name={item.icon} className="size-4" />}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
              {footer.nav?.items?.map((item, i) => (
                <div key={i} className="text-left">
                  <p className="mb-4 font-bold text-gray-800 dark:text-gray-200">{item.title}</p>
                  <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    {item.children?.map((iitem, ii) => (
                      <li key={ii} className="font-medium hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                        <a href={iitem.url} target={iitem.target}>
                          {iitem.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <a href="https://startupfa.me/s/ai-dream-scope?utm_source=aidreamscope.com" target="_blank">
                <img src="https://startupfa.me/badges/featured-badge-small.webp" alt="Featured on Startup Fame" width="224" height="36" />
              </a>
              <a href="https://right-ai.com/" title="RightAI Tools Directory">
                RightAI Tools Diresctory
              </a>
            </div>
          </div>

          {/* 语言切换器 */}
          {/* <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6 pb-4">
            <LanguageSwitcher />
          </div> */}

          {/* 版权声明 */}
          <div className="flex flex-col pt-4  border-t border-gray-300 mt-12 justify-between gap-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400 lg:flex-row lg:items-center lg:text-left">
            {footer.copyright && <p>{footer.copyright}</p>}
            {footer.agreement && (
              <ul className="flex flex-wrap justify-center gap-4 lg:justify-start">
                {footer.agreement.items?.map((item, i) => (
                  <li key={i} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                    <a href={item.url} target={item.target}>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </footer>
      </div>
    </section>
  );
}

// 语言切换组件
function LanguageSwitcher() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
      {Object.keys(localeNames).map((key: string) => {
        // 构建正确的链接路径
        let href = pathname;
        if (locale) {
          // 移除当前语言路径
          href = pathname.replace(`/${locale}`, '');
        }

        // 对于英语，使用根路径；对于其他语言，添加语言前缀
        if (key !== 'en') {
          href = `/${key}${href}`;
        }

        // 确保路径至少有一个斜杠
        if (href === '') {
          href = '/';
        }

        return (
          <Link
            key={key}
            href={href}
            className={`text-sm transition-colors hover:text-purple-600 dark:hover:text-purple-400 ${
              locale === key ? 'text-purple-700 dark:text-purple-400 font-bold' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {localeNames[key]}
          </Link>
        );
      })}
    </div>
  );
}
