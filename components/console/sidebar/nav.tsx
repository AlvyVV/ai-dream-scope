'use client';

import Icon from '@/components/icon';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types/blocks/base';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemGroup {
  title?: string;
  items: NavItem[];
}

// 将导航项分组
const groupNavItems = (items: NavItem[]): NavItemGroup[] => {
  // 创建默认分组
  const defaultGroup: NavItemGroup = {
    items: [],
  };

  // 如果没有分组信息，则使用默认分组
  if (!items.some(item => item.name)) {
    return [{ ...defaultGroup, items }];
  }

  // 按名称分组
  const groups: Record<string, NavItemGroup> = {};

  items.forEach(item => {
    const groupName = item.name || 'default';

    if (!groups[groupName]) {
      groups[groupName] = {
        title: groupName !== 'default' ? groupName : undefined,
        items: [],
      };
    }

    groups[groupName].items.push(item);
  });

  // 转换为数组并确保默认分组在前面
  const groupsArray = Object.values(groups);
  const defaultGroupIndex = groupsArray.findIndex(group => !group.title);

  if (defaultGroupIndex > 0) {
    const defaultGroup = groupsArray.splice(defaultGroupIndex, 1)[0];
    groupsArray.unshift(defaultGroup);
  }

  return groupsArray;
};

export default function ({ className, items, ...props }: { className?: string; items: NavItem[] }) {
  const pathname = usePathname();
  const groupedItems = groupNavItems(items);
  const isMobile = useIsMobile();

  return (
    <nav className={cn('flex flex-col space-y-1 px-2 py-2', className)} {...props}>
      {groupedItems.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-2 mb-2">
          {group.title && (
            <div className={cn('px-3', isMobile ? 'py-1.5' : 'py-2')}>
              <h3 className="text-sm font-medium text-muted-foreground">{group.title}</h3>
            </div>
          )}
          <div className="space-y-1">
            {group.items.map((item, itemIndex) => {
              const isActive = item.is_active || pathname === item.url;

              return (
                <Link
                  key={itemIndex}
                  href={item.url || '#'}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    isActive ? 'bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground' : 'hover:bg-accent/50 hover:text-accent-foreground',
                    'justify-start w-full text-sm rounded-md',
                    isMobile ? 'py-1 px-2.5' : '',
                    item.className
                  )}
                >
                  {item.icon && <Icon name={item.icon} className={cn('w-4 h-4 mr-2', isActive ? 'text-accent-foreground' : 'text-muted-foreground')} />}
                  <span className="line-clamp-1">{item.title}</span>
                </Link>
              );
            })}
          </div>
          {groupIndex < groupedItems.length - 1 && <Separator className={cn('my-2', isMobile && 'my-1.5')} />}
        </div>
      ))}
    </nav>
  );
}
