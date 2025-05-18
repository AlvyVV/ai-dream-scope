'use client';

import Icon from '@/components/icon';
import LocaleToggle from '@/components/locale/toggle';
import SignToggle from '@/components/sign/toggle';
import ThemeToggle from '@/components/theme/toggle';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Header as HeaderType } from '@/types/blocks/header';
import { Menu } from 'lucide-react';
import Link from 'next/link';

export default function HeaderClient({ header }: { header: HeaderType }) {
  return (
    <div className="block lg:hidden sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 shadow-md z-50">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">{header.brand?.logo?.src && <img src={header.brand.logo.src} alt={header.brand.logo.alt || header.brand.title} className="h-12 w-auto py-1" />}</div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="border-gray-200 dark:border-gray-800">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                <div className="flex items-center gap-2">{header.brand?.logo?.src && <img src={header.brand.logo.src} alt={header.brand.logo.alt || header.brand.title} className="h-8 w-auto" />}</div>
              </SheetTitle>
            </SheetHeader>
            <div className="mb-8 mt-8 flex flex-col gap-4">
              <Accordion type="single" collapsible className="w-full">
                {header.nav?.items?.map((item, i) => {
                  if (item.children && item.children.length > 0) {
                    return (
                      <AccordionItem key={i} value={item.title || ''} className="border-b-0">
                        <AccordionTrigger className="mb-4 py-0 font-semibold hover:no-underline text-left text-gray-900 dark:text-white">{item.title}</AccordionTrigger>
                        <AccordionContent className="mt-2">
                          {item.children.map((iitem, ii) => (
                            <a
                              key={ii}
                              className={cn(
                                'flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-all duration-300 ease-in-out hover:bg-purple-50/30 hover:text-purple-800 hover:underline hover:underline-offset-4 hover:decoration-2 focus:bg-purple-50/30 focus:text-purple-800 focus:underline focus:underline-offset-4 focus:decoration-2 dark:hover:bg-purple-900/20 dark:hover:text-purple-300 dark:focus:bg-purple-900/20 dark:focus:text-purple-300'
                              )}
                              href={iitem.url}
                              target={iitem.target}
                            >
                              {iitem.icon && <Icon name={iitem.icon} className="size-4 shrink-0 text-gray-600 dark:text-gray-400" />}
                              <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{iitem.title}</div>
                                <p className="text-sm leading-snug text-gray-600 dark:text-gray-400">{iitem.description}</p>
                              </div>
                            </a>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  }
                  return (
                    <a
                      key={i}
                      href={item.url}
                      target={item.target}
                      className="font-medium text-sm my-4 flex items-center gap-2 text-gray-700 hover:text-purple-800 hover:underline hover:underline-offset-4 hover:decoration-2 dark:text-gray-200 dark:hover:text-purple-300 transition-all duration-300 ease-in-out"
                    >
                      {item.title}
                      {item.icon && <Icon name={item.icon} className="size-4 shrink-0" />}
                    </a>
                  );
                })}
              </Accordion>
            </div>
            <div className="flex-1"></div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="mt-2 flex flex-col gap-3">
                {header.buttons?.map((item, i) => {
                  return (
                    <Button key={i} variant={item.variant} className="shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out hover:scale-105 hover:bg-opacity-90 w-full">
                      <Link href={item.url || ''} target={item.target || ''} className="flex items-center gap-1">
                        {item.title}
                        {item.icon && <Icon name={item.icon} className="size-4 shrink-0" />}
                      </Link>
                    </Button>
                  );
                })}

                {header.show_sign && <SignToggle />}
              </div>

              <div className="mt-4 flex items-center gap-2">
                {header.show_locale && <LocaleToggle />}
                <div className="flex-1"></div>
                {header.show_theme && <ThemeToggle />}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
