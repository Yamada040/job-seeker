"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
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
    return stored === null ? true : stored === "true";
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
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-slate-100 dark:bg-black">
      <div className="pointer-events-none absolute inset-0 -z-10" />

      {shouldShowSidebar && <Sidebar onToggle={() => setIsSidebarOpen(false)} />}
      {showSidebar && !isSidebarOpen ? (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-0 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-r-full border border-[#d9c3a0] bg-[#f6efe2] text-[#5b3b1a] shadow-md transition hover:bg-[#efe4d2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          aria-label="サイドバーを開く"
        >
          {">"}
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
          {(headerTitle || headerDescription) && (
            <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/80">
              {headerTitle && <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{headerTitle}</h1>}
              {headerDescription && <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{headerDescription}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
