import './globals.css';
import { ReactNode } from 'react';
import Providers from './providers';
import { Toaster } from 'react-hot-toast'; // 1. Import the Toaster

export const metadata = {
  title: 'CampusBazar',
  description: 'CampusBazar Web Application',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        <Providers>
          {/* 2. Add Toaster here so it's available on every page */}
          <Toaster 
            position="top-center"
            toastOptions={{
              // Using your Forest Green theme for the success toasts!
              success: {
                style: {
                  background: '#1B4332',
                  color: '#fff',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
              },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}