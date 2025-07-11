import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  // 状态
  collapsed: boolean;

  // 动作
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      // 初始状态，从localStorage读取
      collapsed:
        typeof window !== "undefined"
          ? localStorage.getItem("sidebarCollapsed") === "true"
          : false,

      // 设置收起状态
      setCollapsed: (collapsed) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("sidebarCollapsed", String(collapsed));
        }
        set({ collapsed });
      },

      // 切换收起状态
      toggleCollapsed: () => {
        set((state) => {
          const newState = !state.collapsed;
          if (typeof window !== "undefined") {
            localStorage.setItem("sidebarCollapsed", String(newState));
          }
          return { collapsed: newState };
        });
      },
    }),
    {
      name: "sidebar-storage",
    },
  ),
);
