import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Providers from "./providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "CampusBazar",
  description: "CampusBazar Web Application",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-800 antialiased">
        <Providers>
          {/* Global Toast Notifications */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                fontSize: "14px",
                borderRadius: "8px",
              },
              success: {
                style: {
                  background: "#1B4332", // Forest Green
                  color: "#ffffff",
                },
              },
              error: {
                style: {
                  background: "#ef4444",
                  color: "#ffffff",
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
