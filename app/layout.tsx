import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_NAME, getSiteUrl } from "@/lib/constants/site";
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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} | 就活を整理して前進する`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "自己分析・適性チェック・ES管理・企業管理・面接ログを1つにまとめ、就活で次にやるべき行動を明確にするWebアプリ。",
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | 就活を整理して前進する`,
    description:
      "自己分析・適性チェック・ES管理・企業管理・面接ログを1つにまとめ、就活で次にやるべき行動を明確にするWebアプリ。",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | 就活を整理して前進する`,
    description:
      "自己分析・適性チェック・ES管理・企業管理・面接ログを1つにまとめ、就活で次にやるべき行動を明確にするWebアプリ。",
  },
  robots: {
    index: true,
    follow: true,
  },
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
            __html: `(function(){try{var t=localStorage.getItem("ui-theme");var m=t==="dark"?"dark":"light";document.documentElement.classList.add(m==="light"?"theme-light":"theme-dark");}catch(e){document.documentElement.classList.add("theme-light");}})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
