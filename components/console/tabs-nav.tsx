'use client';

import Icon from '@/components/icon';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types/blocks/base';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TabsNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex border-b space-x-1">
      {items.map((item, index) => {
        const isActive = item.is_active || pathname === item.url || (item.url !== '/' && item.url && pathname.includes(item.url));
        return (
          <Link
            key={index}
            href={item.url || '#'}
            className={cn(
              'inline-flex items-center justify-center px-4 py-2 text-sm font-medium',
              'border-b-2 -mb-px',
              isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            )}
          >
            {item.icon && <Icon name={item.icon} className="w-4 h-4 mr-2" />}
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
