'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { NavItem } from '@/types/blocks/base';
import { useRouter } from 'next/navigation';

export default function ({ items }: { items: NavItem[] }) {
  const router = useRouter();

  // 处理菜单项点击
  const handleItemClick = (item: NavItem) => {
    if (item.url) {
      if (item.target === '_blank') {
        // 新窗口打开
        window.open(item.url, '_blank');
      } else {
        // 使用router导航，确保正确的客户端路由
        router.push(item.url);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <MoreHorizontal />
          <span className="sr-only">打开菜单</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`}>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              {item.icon && <Icon name={item.icon} className="w-4 h-4" />}
              {item.title}
            </DropdownMenuItem>
            {index < items.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
