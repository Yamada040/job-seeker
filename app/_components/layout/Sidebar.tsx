"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    label: "ダッシュボード",
    href: "/dashboard",
    icon: HomeIcon,
    description: "全体の概要を確認",
  },
  {
    label: "ES管理",
    href: "/es",
    icon: DocumentTextIcon,
    description: "エントリーシートの作成・管理",
  },
  {
    label: "企業管理",
    href: "/companies",
    icon: BuildingOfficeIcon,
    description: "企業情報の管理・分析",
  },
  {
    label: "プロフィール",
    href: "/profile",
    icon: UserIcon,
    description: "個人設定の管理",
  },
];

const bottomItems: NavItem[] = [
  {
    label: "設定",
    href: "/settings",
    icon: Cog6ToothIcon,
  },
  {
    label: "ログアウト",
    href: "/login",
    icon: ArrowRightOnRectangleIcon,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const NavLink = ({ item, isActive }: { item: NavItem; isActive: boolean }) => (
    <Link
      href={item.href}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
        {
          "bg-gradient-to-r from-amber-100/80 to-orange-100/80 text-amber-700 shadow-sm": isActive,
          "text-slate-600 hover:text-slate-800 hover:bg-white/50": !isActive,
        }
      )}
    >
      <item.icon 
        className={clsx(
          "h-5 w-5 flex-shrink-0 transition-colors",
          {
            "text-amber-600": isActive,
            "text-slate-500 group-hover:text-slate-700": !isActive,
          }
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="truncate">{item.label}</div>
        {item.description && (
          <div className="text-xs text-slate-500 truncate mt-0.5">
            {item.description}
          </div>
        )}
      </div>
    </Link>
  );

  return (
    <div className="fixed left-0 top-0 h-full w-60 bg-white/80 backdrop-blur border-r border-slate-200/70 z-50">
      {/* Header */}
      <div className="flex items-center gap-2 p-6 border-b border-slate-200/50">
        <div className="w-8 h-8 bg-gradient-to-br from-amber-300 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-300/40">
          <span className="text-slate-900 text-sm font-bold">就</span>
        </div>
        <span className="font-semibold text-slate-900">就活Copilot</span>
      </div>

      {/* Main Navigation */}
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

      {/* Bottom Navigation */}
      <div className="border-t border-slate-200/50 p-4">
        <div className="space-y-2">
          {bottomItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </div>

      {/* User Info */}
      <div className="border-t border-slate-200/50 p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/50 shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-300 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-slate-900 text-sm font-bold">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">
              ユーザー
            </div>
            <div className="text-xs text-slate-600 truncate">
              レベル 3 | 150 XP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}