import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Providers from "./providers";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export const metadata: Metadata = {
  title: {
    default: "CampusBazar – Campus Marketplace",
    template: "%s | CampusBazar",
  },
  description:
    "The #1 student-powered peer-to-peer marketplace. Buy, sell, and trade within your campus community safely.",
  keywords: ["campus marketplace", "student marketplace", "campus bazar", "buy sell university"],
  authors: [{ name: "CampusBazar" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    siteName: "CampusBazar",
    title: "CampusBazar – Campus Marketplace",
    description: "Secure P2P trading within your campus community.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#f8fafc] antialiased" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="pb-16 sm:pb-0">{children}</main>
          <MobileBottomNav />
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "14px",
                fontWeight: "500",
                borderRadius: "12px",
                boxShadow:
                  "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)",
              },
              success: {
                style: { background: "#166534", color: "#ffffff" },
                iconTheme: { primary: "#4ade80", secondary: "#fff" },
              },
              error: {
                style: { background: "#991b1b", color: "#ffffff" },
                iconTheme: { primary: "#fca5a5", secondary: "#fff" },
              },
              loading: {
                style: { background: "#1e1e2e", color: "#ffffff" },
              },
            }}
          />
          <SonnerToaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{ style: { fontFamily: "Inter, system-ui, sans-serif" } }}
          />
        </Providers>
      </body>
    </html>
  );
}
