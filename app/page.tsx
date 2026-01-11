"use client";

import { useEffect } from "react";

import { useAppTheme } from "@/app/theme-provider";
import { HomeCta } from "@/app/_components/home/HomeCta";
import { HomeFeatures } from "@/app/_components/home/HomeFeatures";
import { HomeHeader } from "@/app/_components/home/HomeHeader";
import { HomeHero } from "@/app/_components/home/HomeHero";
import { HomeSecurity } from "@/app/_components/home/HomeSecurity";
import { HomeSteps } from "@/app/_components/home/HomeSteps";

export default function Home() {
  const { setTheme } = useAppTheme();
  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-slate-100 dark:bg-black">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_20%,rgba(255,196,38,0.12),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.1),transparent_45%),linear-gradient(135deg,#ffedd5_0%,#e0f2fe_45%,#e9d5ff_100%)] dark:bg-none" />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[url('/bg-abstract.svg')] bg-cover bg-center opacity-80 dark:opacity-10" />

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-10 sm:px-10 sm:py-14">
        <HomeHeader />
        <HomeHero />
        <HomeFeatures />
        <HomeSteps />
        <HomeCta />
        <HomeSecurity />
      </main>
    </div>
  );
}
