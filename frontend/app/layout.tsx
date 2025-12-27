import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'CampusBazar',
  description: 'CampusBazar Web Application',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
