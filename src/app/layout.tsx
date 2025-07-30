import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "@/components/providers/supabase-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthButton } from "@/components/auth/auth-button";
import { Toaster } from "sonner";
import Link from "next/link";

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
            <div className="min-h-screen flex flex-col">
              {/* Navigation */}
              <header className="border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                  <Link href="/" className="font-bold text-xl">
                    TaskPriority AI
                  </Link>
                  <nav className="flex items-center gap-4">
                    <AuthButton />
                  </nav>
                </div>
              </header>
              
              {/* Main content */}
              <main className="flex-1">
                {children}
              </main>
            </div>
            <Toaster position="bottom-right" />
          </QueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
