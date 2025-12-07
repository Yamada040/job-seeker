"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface HeaderProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

// Generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with dashboard
  if (pathname !== "/dashboard") {
    breadcrumbs.push({ label: "ダッシュボード", href: "/dashboard" });
  }

  // Map path segments to breadcrumbs
  let currentPath = "";
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    
    let label = segment;
    switch (segment) {
      case "dashboard":
        label = "ダッシュボード";
        break;
      case "es":
        label = "ES管理";
        break;
      case "companies":
        label = "企業管理";
        break;
      case "profile":
        label = "プロフィール";
        break;
      case "new":
        label = "新規作成";
        break;
      case "settings":
        label = "設定";
        break;
      default:
        // For dynamic segments (like IDs), try to make them more readable
        if (segment.length > 20) {
          label = "詳細";
        }
    }
    
    breadcrumbs.push({ label, href: currentPath });
  });

  return breadcrumbs;
}

export function Header({ title, description, actions, breadcrumbs }: HeaderProps) {
  const pathname = usePathname();
  const generatedBreadcrumbs = breadcrumbs || generateBreadcrumbs(pathname);

  return (
    <header className="bg-white border-b border-[var(--border-light)] px-6 py-4">
      <div className="flex flex-col gap-3">
        {/* Breadcrumbs */}
        {generatedBreadcrumbs.length > 1 && (
          <nav className="flex items-center space-x-1 text-sm">
            <HomeIcon className="h-4 w-4 text-[var(--foreground-tertiary)]" />
            <ChevronRightIcon className="h-4 w-4 text-[var(--foreground-tertiary)]" />
            
            {generatedBreadcrumbs.map((item, index) => (
              <div key={item.href} className="flex items-center space-x-1">
                {index === generatedBreadcrumbs.length - 1 ? (
                  <span className="text-[var(--foreground)] font-medium">
                    {item.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={item.href}
                      className="text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {item.label}
                    </Link>
                    <ChevronRightIcon className="h-4 w-4 text-[var(--foreground-tertiary)]" />
                  </>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Title and Actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {title && (
              <h1 className="text-2xl font-semibold text-[var(--foreground)] truncate">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-2 ml-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Predefined header configurations for common pages
export const pageHeaders = {
  dashboard: {
    title: "ダッシュボード",
    description: "就活の進捗を一覧で確認",
  },
  es: {
    title: "ES管理",
    description: "エントリーシートの作成・管理",
  },
  "es-detail": {
    title: "ES詳細",
    description: "エントリーシートの編集・AI添削",
  },
  "es-new": {
    title: "新しいES",
    description: "エントリーシートを作成",
  },
  companies: {
    title: "企業管理",
    description: "志望企業の情報管理・分析",
  },
  "company-detail": {
    title: "企業詳細",
    description: "企業情報の確認・編集",
  },
  "company-new": {
    title: "新しい企業",
    description: "企業情報を追加",
  },
  profile: {
    title: "プロフィール",
    description: "個人設定の管理",
  },
} as const;