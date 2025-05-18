import Header from '@/components/blocks/header';
import SidebarNav from '@/components/console/sidebar/nav';
import { Sidebar } from '@/types/blocks/sidebar';
import { ReactNode } from 'react';

export default async function ConsoleLayout({ children, sidebar }: { children: ReactNode; sidebar?: Sidebar }) {
  return (
    <div className="container md:max-w-7xl py-8 mx-auto">
      <Header />
      <div className="w-full space-y-6 px-4 pb-16 block lg:py-24">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          {sidebar?.nav?.items && (
            <aside className="-mx-4 lg:w-1/5">
              <div className="rounded-lg border bg-card text-card-foreground shadow">
                {sidebar.nav?.title && (
                  <div className="border-b px-4 sm:px-6 py-3 sm:py-4">
                    <h2 className="text-base sm:text-lg font-semibold tracking-tight">{sidebar.nav.title}</h2>
                  </div>
                )}
                <SidebarNav items={sidebar.nav?.items} />
              </div>
            </aside>
          )}
          <div className="flex-1 lg:max-w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
