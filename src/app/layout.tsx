import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FavoritesSidebar from "@/components/FavoritesSidebar";
import SidebarClient from "@/components/SidebarClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromptWiki",
  description: "Private prompt management wiki",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isDark = cookieStore.get("theme")?.value === "dark";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${isDark ? " dark" : ""}`}
    >
      <head>
        <meta name="theme-color" content={isDark ? "#000000" : "#ffffff"} />
      </head>
      <body className="min-h-full flex flex-col bg-background">
        <SidebarClient
          header={<Header />}
          sidebar={<Sidebar />}
          rightSidebar={<FavoritesSidebar />}
        >
          {children}
        </SidebarClient>
      </body>
    </html>
  );
}
