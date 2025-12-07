"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { clsx } from "clsx";

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
  className 
}: AppLayoutProps) {
  const pathname = usePathname();
  
  // Don't show layout for login page
  if (pathname === "/login" || pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-100 text-slate-900">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,196,38,0.12),transparent_60%)] blur-2xl" />
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1),transparent_60%)] blur-2xl" />
      </div>
      
      {/* Sidebar */}
      {showSidebar && <Sidebar />}
      
      {/* Main Content Area */}
      <div 
        className={clsx(
          "min-h-screen",
          {
            "ml-60": showSidebar,
            "ml-0": !showSidebar,
          }
        )}
      >
        {/* Header */}
        {showHeader && (
          <Header
            title={headerTitle}
            description={headerDescription}
            actions={headerActions}
          />
        )}
        
        {/* Page Content */}
        <main 
          className={clsx(
            "mx-auto max-w-6xl px-6 py-8 sm:px-10 sm:py-12",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// Convenience wrapper for common page types
export function DashboardLayout({ children, ...props }: Omit<AppLayoutProps, "headerTitle" | "headerDescription">) {
  return (
    <AppLayout 
      headerTitle="ダッシュボード"
      headerDescription="就活の進捗を一覧で確認"
      {...props}
    >
      {children}
    </AppLayout>
  );
}

export function ESLayout({ children, ...props }: Omit<AppLayoutProps, "headerTitle" | "headerDescription">) {
  return (
    <AppLayout 
      headerTitle="ES管理"
      headerDescription="エントリーシートの作成・管理"
      {...props}
    >
      {children}
    </AppLayout>
  );
}

export function CompanyLayout({ children, ...props }: Omit<AppLayoutProps, "headerTitle" | "headerDescription">) {
  return (
    <AppLayout 
      headerTitle="企業管理"
      headerDescription="志望企業の情報管理・分析"
      {...props}
    >
      {children}
    </AppLayout>
  );
}

export function ProfileLayout({ children, ...props }: Omit<AppLayoutProps, "headerTitle" | "headerDescription">) {
  return (
    <AppLayout 
      headerTitle="プロフィール"
      headerDescription="個人設定の管理"
      {...props}
    >
      {children}
    </AppLayout>
  );
}