"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { ThemeToggle } from "../theme-toggle";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
}

const navigationItems: NavItem[] = [
  { label: "ダッシュボード", href: "/dashboard", icon: HomeIcon, description: "全体の概要を確認" },
  { label: "ES管理", href: "/es", icon: DocumentTextIcon, description: "エントリーシートを整理" },
  { label: "企業管理", href: "/companies", icon: BuildingOfficeIcon, description: "企業カードと進捗を記録" },
  { label: "適性チェック", href: "/aptitude", icon: LightBulbIcon, description: "業界・職種の向き不向きを診断" },
  { label: "自己分析", href: "/self-analysis", icon: ClipboardDocumentCheckIcon, description: "強み・価値観を整理" },
  { label: "面接ログ", href: "/interviews", icon: ChatBubbleLeftRightIcon, description: "面接の質問・回答を記録" },
  { label: "Webテスト対策", href: "/webtests", icon: AcademicCapIcon, description: "演習用の問題を管理" },
  { label: "プロフィール", href: "/profile", icon: UserIcon, description: "ユーザー設定とアバター" },
];

const bottomItems: NavItem[] = [
  { label: "ログアウト", href: "/login", icon: ArrowRightOnRectangleIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  const NavLink = ({ item, isActive }: { item: NavItem; isActive: boolean }) => (
    <Link
      href={item.href}
      className={clsx(
        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
        {
          "bg-white/90 text-amber-700 shadow-md shadow-amber-200/50 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30 dark:shadow-none":
            isActive,
          "text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-900":
            !isActive,
        }
      )}
    >
      <item.icon
        className={clsx("h-5 w-5 shrink-0 transition-colors", {
          "text-amber-600 dark:text-amber-400": isActive,
          "text-slate-500 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-300": !isActive,
        })}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate">{item.label}</div>
        {item.description && (
          <div className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
        )}
      </div>
    </Link>
  );

  return (
    <div className="fixed left-0 top-0 z-50 h-full w-60 border-r border-white/50 bg-white/70 backdrop-blur dark:border-gray-800 dark:bg-black">
      <div className="flex items-center gap-2 border-b border-white/60 p-6 dark:border-gray-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-amber-300 to-orange-500 text-sm font-bold text-slate-900 shadow-md shadow-amber-300/40">
          就
        </div>
        <span className="font-semibold text-slate-900 dark:text-slate-100">就活Copilot</span>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          ))}
        </div>
      </nav>

      <div className="border-t border-white/60 p-4 dark:border-gray-800">
        <div className="space-y-3">
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
          <div className="space-y-2">
            {bottomItems.map((item) => (
              <NavLink key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/60 p-4 dark:border-gray-800">
        <div className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/90 p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber-300 to-orange-500 text-sm font-bold text-slate-900 shadow-md">
            U
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">ユーザー</div>
            <div className="truncate text-xs text-slate-600 dark:text-slate-400">レベル 3 | 150 XP</div>
          </div>
        </div>
      </div>
    </div>
  );
}
