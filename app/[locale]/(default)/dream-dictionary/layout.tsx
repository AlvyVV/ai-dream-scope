import { ReactNode } from 'react';
export default async function DefaultLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
