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
  leftContent?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actionsPlacement?: "left" | "right";
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  if (pathname !== "/dashboard") {
    breadcrumbs.push({ label: "ダッシュボード", href: "/dashboard" });
  }

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
      case "aptitude":
        label = "適性チェック";
        break;
      case "self-analysis":
        label = "自己分析";
        break;
      case "interviews":
        label = "面接ログ";
        break;
      case "webtests":
        label = "Webテスト対策";
        break;
      case "profile":
        label = "プロフィール";
        break;
      case "new":
        label = "新規作成";
        break;
      default:
        if (segment.length > 20) {
          label = "詳細";
        }
    }

    breadcrumbs.push({ label, href: currentPath });
  });

  return breadcrumbs;
}

export function Header({ title, description, actions, leftContent, breadcrumbs, actionsPlacement = "left" }: HeaderProps) {
  const pathname = usePathname();
  const generatedBreadcrumbs = breadcrumbs || generateBreadcrumbs(pathname);

  return (
    <header className="border-b border-white/40 bg-white/70 px-6 py-4 backdrop-blur dark:border-gray-800 dark:bg-black">
      <div className="flex flex-col gap-3">
        {generatedBreadcrumbs.length > 1 && (
          <nav className="flex items-center space-x-1 text-sm">
            <HomeIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <ChevronRightIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />

            {generatedBreadcrumbs.map((item, index) => (
              <div key={item.href} className="flex items-center space-x-1">
                {index === generatedBreadcrumbs.length - 1 ? (
                  <span className="font-medium text-slate-800 dark:text-slate-100">{item.label}</span>
                ) : (
                  <>
                    <Link
                      href={item.href}
                      className="text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                    >
                      {item.label}
                    </Link>
                    <ChevronRightIcon className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                  </>
                )}
              </div>
            ))}
          </nav>
        )}

        {actionsPlacement === "left" ? (
          <div className="flex items-start justify-between gap-6">
            {leftContent ? (
              <div className="flex-shrink-0">{leftContent}</div>
            ) : null}
            <div className="flex-1 min-w-0">
              {title && <h1 className="truncate text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>}
              {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>}
            </div>
            {actions ? (
              <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {title && <h1 className="truncate text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>}
              {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>}
            </div>

            <div className={clsx("ml-4 flex items-center gap-2")}>
              {actions}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
