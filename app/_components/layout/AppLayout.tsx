"use client";

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

  // ログインとホームは素の表示
  if (pathname === "/login" || pathname === "/") {
    return <>{children}</>;
  }

  const leftContent = headerLeftContent ?? <XpBadge />;

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
          <Header
            actions={headerActions}
            leftContent={leftContent}
            actionsPlacement={actionsPlacement ?? "left"}
          />
        )}

        <main
          className={clsx("mx-auto max-w-7xl px-6 py-8 sm:px-10 sm:py-12", className)}
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
