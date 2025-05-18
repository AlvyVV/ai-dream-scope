'use client';

import Icon from '@/components/icon';
import LocaleToggle from '@/components/locale/toggle';
import SignToggle from '@/components/sign/toggle';
import ThemeToggle from '@/components/theme/toggle';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Header as HeaderType } from '@/types/blocks/header';
import Link from 'next/link';

export default function HeaderClient({ header }: { header: HeaderType }) {
  return (
    <section className="hidden lg:block sticky top-4 md:top-12 z-50">
      <div className="container mx-auto px-4 border-b border-gray-200 rounded-md bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80 shadow-md">
        <nav className="hidden h-16 justify-between lg:flex">
          <div className="flex items-center gap-6">
            <a href={header.brand?.url || ''} className="flex items-center gap-2">
              {header.brand?.logo?.src && <img src={header.brand.logo.src} alt={header.brand.logo.alt || header.brand.title} className="w-auto h-16 py-1" />}
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="gap-4">
                  {header.nav?.items?.map((item, i) => {
                    if (item.children && item.children.length > 0) {
                      return (
                        <NavigationMenuItem key={i}>
                          <NavigationMenuTrigger className="text-gray-600 dark:text-gray-300">
                            {item.icon && <Icon name={item.icon} className="size-4 shrink-0 mr-2" />}
                            <span>{item.title}</span>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="w-80 p-3">
                              <div>
                                {item.children.map((iitem, ii) => (
                                  <li key={ii}>
                                    <a
                                      className={cn(
                                        'flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white dark:focus:bg-gray-800 dark:focus:text-white'
                                      )}
                                      href={iitem.url}
                                      target={iitem.target}
                                    >
                                      {iitem.icon && <Icon name={iitem.icon} className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />}
                                      <div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{iitem.title}</div>
                                        <p className="text-sm leading-snug text-gray-600 dark:text-gray-400">{iitem.description}</p>
                                      </div>
                                    </a>
                                  </li>
                                ))}
                              </div>
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      );
                    }

                    return (
                      <NavigationMenuItem key={i}>
                        <a
                          className={cn(
                            'text-gray-700 font-medium text-sm hover:text-purple-800 hover:underline hover:underline-offset-4 hover:decoration-2 dark:text-gray-200 dark:hover:text-purple-300 transition-all duration-300 ease-in-out hover:scale-105 px-2',
                            navigationMenuTriggerStyle
                          )}
                          href={item.url}
                          target={item.target}
                        >
                          {item.icon && <Icon name={item.icon} className="size-4 shrink-0 mr-2" />}
                          {item.title}
                        </a>
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="shrink-0 flex gap-2 items-center">
            {header.show_locale && <LocaleToggle />}
            {header.show_theme && <ThemeToggle />}

            {header.buttons?.map((item, i) => {
              return (
                <Button key={i} variant={item.variant} className="shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out hover:scale-105 hover:bg-opacity-90">
                  <Link href={item.url || ''} target={item.target || ''} className="flex items-center gap-1">
                    {item.title}
                    {item.icon && <Icon name={item.icon} className="size-4 shrink-0" />}
                  </Link>
                </Button>
              );
            })}
            {header.show_sign && <SignToggle />}
          </div>
        </nav>
      </div>
    </section>
  );
}
