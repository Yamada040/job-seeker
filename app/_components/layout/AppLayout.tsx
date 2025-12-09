"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerDescription?: string;
  headerActions?: React.ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
  className?: string;
}

export function AppLayout({
  children,
  headerTitle,
  headerDescription,
  headerActions,
  showHeader = true,
  showSidebar = true,
  className,
}: AppLayoutProps) {
  const pathname = usePathname();

  // ログインとホームは素の表示
  if (pathname === "/login" || pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-slate-100 dark:bg-black">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,196,38,0.12),transparent_50%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.12),transparent_55%)] dark:bg-none" />
      </div>

      {showSidebar && <Sidebar />}

      <div
        className={clsx("min-h-screen", {
          "ml-60": showSidebar,
          "ml-0": !showSidebar,
        })}
      >
        {showHeader && (
          <Header title={headerTitle} description={headerDescription} actions={headerActions} />
        )}

        <main
          className={clsx("mx-auto max-w-7xl px-6 py-8 sm:px-10 sm:py-12", className)}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// Convenience wrappers
export function DashboardLayout({
  children,
  ...props
}: Omit<AppLayoutProps, "headerTitle" | "headerDescription">) {
  return (
    <AppLayout headerTitle="ダッシュボード" headerDescription="就活の進捗を一覧で確認" {...props}>
      {children}
    </AppLayout>
  );
}

export function ESLayout({
  children,
  ...props
}: Omit<AppLayoutProps, "headerTitle" | "headerDescription">) {
  return (
    <AppLayout headerTitle="ES管理" headerDescription="エントリーシートの作成・管理" {...props}>
      {children}
    </AppLayout>
  );
}

export function CompanyLayout({
  children,
  ...props
}: Omit<AppLayoutProps, "headerTitle" | "headerDescription">) {
  return (
    <AppLayout headerTitle="企業管理" headerDescription="志望企業の情報管理・分析" {...props}>
      {children}
    </AppLayout>
  );
}

export function ProfileLayout({
  children,
  ...props
}: Omit<AppLayoutProps, "headerTitle" | "headerDescription">) {
  return (
    <AppLayout headerTitle="プロフィール" headerDescription="個人設定とアバター管理" {...props}>
      {children}
    </AppLayout>
  );
}
