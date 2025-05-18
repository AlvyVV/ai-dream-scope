import '@/app/globals.css';

import { getMessages } from 'next-intl/server';

import { NextAuthSessionProvider } from '@/auth/session';
import { ClarityAnalytics } from '@/components/analytics/ClarityAnalytics';
import GoogleAnalytics from '@/components/analytics/google-analytics';
import { AppContextProvider } from '@/contexts/app';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/providers/theme';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import PlausibleProvider from 'next-plausible';
import { Montserrat, Open_Sans } from 'next/font/google';

// 标题字体 - 使用preload和display swap优化加载
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
  // 仅加载必要的字重以减少字体文件大小
  weight: ['500', '700'],
});

// 正文字体 - 使用preload和display swap优化加载
const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  // 仅加载必要的字重以减少字体文件大小
  weight: ['400', '500', '600'],
});

export default async function RootLayout(props: { children: React.ReactNode }) {
  const children = props.children;
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 预加载关键资源 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7540882621555670" crossOrigin="anonymous"></script>
        {/* <meta name="_foundr" content="bfe12ae85149e3071869ad8757e94fc7" /> */}
        <meta name="google-adsense-account" content="ca-pub-7540882621555670" />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased', openSans.variable, montserrat.variable)}>
        <NextIntlClientProvider messages={messages}>
          <NextAuthSessionProvider>
            <AppContextProvider>
              <ThemeProvider attribute="class" disableTransitionOnChange>
                <PlausibleProvider
                  domain="aidreamscope.com"
                  hash={true}
                  trackOutboundLinks={true}
                  taggedEvents={true}
                  trackFileDownloads={true}
                  selfHosted={true}
                  customDomain="https://vvalvv.zitchoo.com"
                >
                  {children}
                </PlausibleProvider>
              </ThemeProvider>
            </AppContextProvider>
          </NextAuthSessionProvider>
        </NextIntlClientProvider>
        {/* 仅在客户端组件中加载分析工具，减少服务器组件的大小 */}
        <ClarityAnalytics />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
