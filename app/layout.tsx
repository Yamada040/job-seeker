import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "就活AI Copilot | MVP",
  description: "ES添削・企業管理・タスク進捗をAIで支援し、前向きに就活を進めるためのMVP版Webアプリ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("ui-theme");var m=t==="light"?"light":"dark";document.documentElement.classList.add(m==="light"?"theme-light":"theme-dark");}catch(e){document.documentElement.classList.add("theme-dark");}})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
