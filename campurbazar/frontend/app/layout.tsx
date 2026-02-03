import './globals.css';
import { ReactNode } from 'react';
import Providers from './providers';

export const metadata = {
  title: 'CampusBazar',
  description: 'CampusBazar Web Application',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
