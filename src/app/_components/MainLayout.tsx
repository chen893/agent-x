"use client";

import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { collapsed } = useSidebarStore();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 侧边栏 - 仅在大屏幕上显示 */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* 主内容区域 - 根据侧边栏状态调整宽度 */}
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-300 ease-in-out",
        )}
      >
        {/*           {
            "md:ml-[160px]": !collapsed,
            "md:ml-[70px]": collapsed,
          }, */}
        {children}
      </main>
    </div>
  );
}
