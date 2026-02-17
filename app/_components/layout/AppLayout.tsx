"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Sidebar } from "./Sidebar";
import { Breadcrumbs, Header } from "./Header";
import { XpBadge } from "../xp-badge";

interface AppLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerDescription?: string;
  headerActions?: React.ReactNode;
  headerLeftContent?: React.ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
  className?: string;
  actionsPlacement?: "left" | "right";
}

export function AppLayout({
  children,
  headerTitle,
  headerDescription,
  headerActions,
  headerLeftContent,
  showHeader = true,
  showSidebar = true,
  className,
  actionsPlacement,
}: AppLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem("sidebar-open");
    return stored !== null ? stored === "true" : true;
  });

  useEffect(() => {
    if (!showSidebar) return;
    window.localStorage.setItem("sidebar-open", String(isSidebarOpen));
  }, [isSidebarOpen, showSidebar]);

  // ログインとホームは素の表示
  if (pathname === "/login" || pathname === "/") {
    return <>{children}</>;
  }

  const leftContent = headerLeftContent ?? <XpBadge />;
  const shouldShowSidebar = showSidebar && isSidebarOpen;

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10" />

      {shouldShowSidebar && <Sidebar />}
      {showSidebar ? (
        <button
          type="button"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="fixed left-6 top-6 z-[60] flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-yellow-400"
          aria-label={isSidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
        >
          <span className="flex h-4 w-4 flex-col items-center justify-between">
            <span className="h-[2px] w-full bg-current" />
            <span className="h-[2px] w-full bg-current" />
            <span className="h-[2px] w-full bg-current" />
          </span>
        </button>
      ) : null}

      <div
        className={clsx("min-h-screen transition-[margin] duration-300", {
          "ml-60": shouldShowSidebar,
          "ml-0": !shouldShowSidebar,
        })}
      >
        {showHeader && (
          <Header
            actions={headerActions}
            leftContent={leftContent}
            actionsPlacement={actionsPlacement ?? "left"}
            showBrand
          />
        )}

        <main
          className={clsx("mx-auto max-w-7xl px-6 pb-8 pt-24 sm:px-10 sm:pb-12", className)}
        >
          <Breadcrumbs />
          {(headerTitle || headerDescription) && (
            <div className="mt-4">
              {headerTitle && <h1 className="text-lg font-semibold text-white">{headerTitle}</h1>}
              {headerDescription && <p className="mt-1 text-sm text-white/70">{headerDescription}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
