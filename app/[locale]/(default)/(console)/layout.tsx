import { auth } from '@/auth';
import Header from '@/components/blocks/header';
import TabsNav from '@/components/console/tabs-nav';
import UserAvatar from '@/components/console/user-avatar';
import { getUserInfo } from '@/services/user';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function Layout(props: { children: ReactNode }) {
  const children = props.children;
  // 获取数据库中的用户信息
  const userInfo = await getUserInfo();
  console.log('userInfo', userInfo);
  if (!userInfo || !userInfo.email) {
    redirect('/auth/signin');
  }

  // 获取会话中的用户信息
  const session = await auth();
  // 优先使用会话中的头像URL（可能更新）
  const avatarUrl = session?.user?.image || session?.user?.avatar_url || userInfo.avatar_url;

  // 验证头像URL是否有效
  const isValidUrl = (url?: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch (e) {
      return false;
    }
  };

  const validAvatarUrl = isValidUrl(avatarUrl) ? avatarUrl : null;

  const t = await getTranslations();

  const navItems = [
    {
      title: t('user.my_chat'),
      url: '/my-chat',
      icon: 'RiMessage2Line',
      is_active: false,
    },
    // 取消注释以添加更多导航项
    // {
    //   title: t('user.my_orders'),
    //   url: '/my-orders',
    //   icon: 'RiOrderPlayLine',
    //   is_active: false,
    // },
    // {
    //   title: t('my_credits.title'),
    //   url: '/my-credits',
    //   icon: 'RiBankCardLine',
    //   is_active: false,
    // },
    // {
    //   title: t('api_keys.title'),
    //   url: '/api-keys',
    //   icon: 'RiKey2Line',
    //   is_active: false,
    // },
  ];

  return (
    <div className="container mx-auto py-8">
      <Header />
      <div className="mt-8">
        <div className="flex flex-col space-y-6">
          {/* 用户信息区域 */}
          <div className="flex items-center space-x-4">
            <UserAvatar avatarUrl={validAvatarUrl} nickname={userInfo.nickname} email={userInfo.email} />
            <div>
              <h1 className="text-xl font-semibold">{userInfo.nickname || userInfo.email}</h1>
              <p className="text-sm text-muted-foreground">{userInfo.email}</p>
            </div>
          </div>

          {/* 标签式导航 */}
          <TabsNav items={navItems} />

          {/* 内容区域 */}
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
