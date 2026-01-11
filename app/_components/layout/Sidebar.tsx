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
    description: "エントリーシートを整理",
  },
  {
    label: "企業管理",
    href: "/companies",
    icon: BuildingOfficeIcon,
    description: "企業カードと進捗を記録",
  },
  {
    label: "適性チェック",
    href: "/aptitude",
    icon: LightBulbIcon,
    description: "業界・職種の向き不向きを診断",
  },
  {
    label: "自己分析",
    href: "/self-analysis",
    icon: ClipboardDocumentCheckIcon,
    description: "強み・価値観を整理",
  },
  {
    label: "面接ログ",
    href: "/interviews",
    icon: ChatBubbleLeftRightIcon,
    description: "面接の質問・回答を記録",
  },
  {
    label: "Webテスト対策",
    href: "/webtests",
    icon: AcademicCapIcon,
    description: "演習用の問題を管理",
  },
  {
    label: "プロフィール",
    href: "/profile",
    icon: UserIcon,
    description: "ユーザー設定とアバター",
  },
];

const bottomItems: NavItem[] = [
  { label: "ログアウト", href: "/login", icon: ArrowRightOnRectangleIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  const NavLink = ({
    item,
    isActive,
  }: {
    item: NavItem;
    isActive: boolean;
  }) => (
    <Link
      href={item.href}
      className={clsx("dq-menu-item", isActive && "dq-menu-item-active")}
    >
      <item.icon
        className={clsx(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-sky-300" : "text-white"
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs">{item.label}</div>
        {item.description && (
          <div className="mt-0.5 truncate text-[0.65rem] font-normal text-white/70">
            {item.description}
          </div>
        )}
      </div>
    </Link>
  );

  return (
    <div className="fixed left-0 top-20 z-40 h-[calc(100vh-5rem)] w-60 border-r border-[#3b2a18] bg-black/75 backdrop-blur">
      <div className="flex h-full flex-col gap-6 overflow-y-auto px-5 py-7">
        <nav className="flex-1">
          <div className="space-y-3">
            {navigationItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={
                  pathname === item.href || pathname.startsWith(item.href + "/")
                }
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-white/20 pt-5">
          <div className="space-y-4">
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
        </div>

        <div className="flex justify-center pb-2">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
