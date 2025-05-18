'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { clearDreamChat } from '@/lib/chat-storage';
import { devLog } from '@/lib/utils';
import { User } from '@/types/user';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

export default function ({ user }: { user: User }) {
  const t = useTranslations();
  const [imageError, setImageError] = useState(false);

  // Generate user initials as avatar fallback
  const getInitials = () => {
    if (!user?.nickname) return 'U';
    return user.nickname.substring(0, 2).toUpperCase();
  };

  // Handle image loading error
  const handleImageError = () => {
    devLog('Avatar loading failed:', user.avatar_url);
    setImageError(true);
  };

  // 处理用户退出
  const handleSignOut = () => {
    // 清除聊天记录
    clearDreamChat();
    // 执行登出操作
    signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          {user.avatar_url && !imageError ? <AvatarImage src={user.avatar_url} alt={user.nickname || 'User'} onError={handleImageError} /> : null}
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-4">
        <DropdownMenuLabel className="text-center truncate">{user.nickname || 'Loading...'}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/my-chat" className="flex justify-center cursor-pointer">
            {t('user.my_chat')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {/* <DropdownMenuItem asChild>
          <Link href="/my-orders" className="flex justify-center cursor-pointer">
            {t('user.my_orders')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/my-credits" className="flex justify-center cursor-pointer">
            {t('my_credits.title')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/api-keys" className="flex justify-center cursor-pointer">
            {t('api_keys.title')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator /> */}

        <DropdownMenuItem className="flex justify-center cursor-pointer" onClick={handleSignOut}>
          {t('user.sign_out')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
