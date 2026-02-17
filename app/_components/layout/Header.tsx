"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

export interface BreadcrumbItem {
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
  actionsPlacement = "left",
  showBrand,
}: HeaderProps) {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[#3b2a18] bg-[#1b1b1b]/85 px-6 py-4 backdrop-blur">
      <div className="flex flex-col gap-3">
        {actionsPlacement === "left" ? (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {showBrand ? (
                <div className="flex w-60 items-center gap-1 pl-16">
                  <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-lg font-bold text-white ring-1 ring-white/60">
                    <span className="absolute inset-0 bg-[url('/shield.png')] bg-contain bg-center bg-no-repeat brightness-200" />
                    <span className="relative drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]">
                      就
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-slate-100">
                    就活Copilot
                  </span>
                </div>
              ) : null}
              {leftContent ? (
                <div className="flex-shrink-0">{leftContent}</div>
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="truncate text-2xl font-semibold text-slate-100">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-sm text-slate-300">{description}</p>
              )}
            </div>
            {actions ? (
              <div className="flex-shrink-0 flex items-center gap-2 [&_.dq-button-secondary]:border-0 [&_.dq-button-secondary]:bg-transparent [&_.dq-button-secondary]:shadow-none [&_.dq-button-secondary]:px-2 [&_.dq-button-secondary]:py-1 [&_.dq-button]:border-0 [&_.dq-button]:bg-transparent [&_.dq-button]:shadow-none [&_.dq-button]:px-2 [&_.dq-button]:py-1">
                {actions}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="truncate text-2xl font-semibold text-slate-100">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-sm text-slate-300">{description}</p>
              )}
            </div>

            <div
              className={clsx(
                "ml-4 flex items-center gap-2 [&_.dq-button-secondary]:border-0 [&_.dq-button-secondary]:bg-transparent [&_.dq-button-secondary]:shadow-none [&_.dq-button-secondary]:px-2 [&_.dq-button-secondary]:py-1 [&_.dq-button]:border-0 [&_.dq-button]:bg-transparent [&_.dq-button]:shadow-none [&_.dq-button]:px-2 [&_.dq-button]:py-1"
              )}
            >
              {actions}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs?: BreadcrumbItem[] }) {
  const pathname = usePathname();
  const generatedBreadcrumbs = breadcrumbs || generateBreadcrumbs(pathname);

  if (generatedBreadcrumbs.length <= 1) return null;

  return (
    <nav className="mt-4 flex items-center space-x-1 text-xs font-bold text-white/80">
      <HomeIcon className="h-4 w-4 text-white/70" />
      <ChevronRightIcon className="h-4 w-4 text-white/40" />

      {generatedBreadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center space-x-1">
          {index === generatedBreadcrumbs.length - 1 ? (
            <span className="text-white">{item.label}</span>
          ) : (
            <>
              <Link href={item.href} className="transition-colors hover:text-yellow-300">
                {item.label}
              </Link>
              <ChevronRightIcon className="h-4 w-4 text-white/40" />
            </>
          )}
        </div>
      ))}
    </nav>
  );
}
