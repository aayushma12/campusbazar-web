import { ReactNode } from 'react';
import Header from './_components/Header';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="p-8">{children}</main>
    </div>
  );
}
