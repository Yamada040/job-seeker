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
  showBrand?: boolean;
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

export function Header({
  title,
  description,
  actions,
  leftContent,
  breadcrumbs,
  actionsPlacement = "left",
  showBrand,
}: HeaderProps) {
  const pathname = usePathname();
  const generatedBreadcrumbs = breadcrumbs || generateBreadcrumbs(pathname);

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[#d9c3a0] bg-[#f7f0e3]/90 px-6 py-4 backdrop-blur dark:border-gray-800 dark:bg-black">
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
            <div className="flex items-center gap-3">
              {showBrand ? (
                <div className="flex items-center gap-1">
                  <span className="relative inline-flex h-14 w-14 items-center justify-center text-lg font-bold text-[#3f2d1b]">
                    <span className="absolute inset-0 bg-[url('/shield.png')] bg-contain bg-center bg-no-repeat" />
                    <span className="relative drop-shadow-[0_1px_0_rgba(255,240,210,0.8)]">就</span>
                  </span>
                  <span className="text-sm font-semibold text-[#3e2a16] dark:text-slate-100">就活Copilot</span>
                </div>
              ) : null}
              {leftContent ? <div className="flex-shrink-0">{leftContent}</div> : null}
            </div>
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

            <div className={clsx("ml-4 flex items-center gap-2")}>{actions}</div>
          </div>
        )}
      </div>
    </header>
  );
}
