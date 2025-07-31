import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "@/components/providers/supabase-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { WebVitalsProvider } from "@/components/providers/web-vitals-provider";
import { Navigation } from "@/components/layout/navigation";
import { SmoothPageTransition } from "@/components/layout/page-transition";
import { ScrollRestorationProvider } from "@/components/providers/scroll-restoration-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskPriority AI - AI-Powered Task Management for Solo Founders",
  description: "Transform user feedback into prioritized action plans. Save 5-10 hours per week with AI-powered task management designed for solo founders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseProvider>
          <QueryProvider>
            <WebVitalsProvider>
              <ScrollRestorationProvider>
                <div className="min-h-screen flex flex-col">
                  {/* Modern Navigation */}
                  <Navigation />
                  
                  {/* Main content with page transitions */}
                  <main className="flex-1">
                    <SmoothPageTransition>
                      {children}
                    </SmoothPageTransition>
                  </main>
                </div>
                <Toaster position="bottom-right" />
              </ScrollRestorationProvider>
            </WebVitalsProvider>
          </QueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
