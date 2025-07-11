"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  MenuIcon,
  Home,
  History,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useAgentStore } from "@/store/agent";
import { useSidebarStore } from "@/store/sidebarStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProjectData } from "@/hooks/useProjectData";
import { cn } from "@/lib/utils";
import { useAgentCompletion } from "@/hooks/useAgentCompletion";

export const Sidebar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // 使用全局状态管理侧边栏
  const { collapsed, toggleCollapsed } = useSidebarStore();

  // 使用Agent状态
  const { currentProjectId, resetToNewProject, isLoadingHistoryProject } =
    useAgentStore();

  // 使用Agent完成hooks
  const { loadProject } = useAgentCompletion();

  // 获取用户项目列表
  const { data: projects, isLoading: projectsLoading } =
    api.project.getUserProjects.useQuery(undefined, {
      enabled: !!session?.user,
    });

  // 创建新对话
  const handleNewConversation = () => {
    resetToNewProject();
    router.push("/");
    toast.success("已创建新对话");
  };

  // 加载项目
  const handleLoadProject = (projectId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        // 使用 loadProject 函数加载项目
        await loadProject(projectId);

        toast.success("已加载项目");
      } catch (error: unknown) {
        console.error(
          "加载项目失败:",
          error instanceof Error ? error.message : String(error),
        );
        toast.error("加载项目失败");
      }
    })();
  };

  // 加载状态
  const renderSkeleton = () => (
    <>
      {Array(3)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className={cn(
              "rounded-xl border border-gray-100 bg-white/80 backdrop-blur",
              collapsed ? "p-2" : "p-3",
            )}
          >
            <div className="flex items-center justify-between">
              <Skeleton className={cn("h-5", collapsed ? "w-5" : "w-32")} />
              {!collapsed && <Skeleton className="h-4 w-16" />}
            </div>
            {!collapsed && <Skeleton className="mt-2 h-4 w-full" />}
          </div>
        ))}
    </>
  );

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-[#e5e5e7] bg-[#f5f5f7] transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[260px]",
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <h2 className="text-base font-semibold text-[#1d1d1f]">Agent X</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="h-8 w-8 rounded-full p-0 text-[#86868b] hover:bg-[#e5e5e7] hover:text-[#1d1d1f]"
          aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className={cn("px-3 pb-3", collapsed ? "space-y-3" : "space-y-4")}>
        {/* 新建对话按钮 */}
        <Button
          onClick={handleNewConversation}
          className={cn(
            "flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0071e3] to-[#2385f3] shadow-sm transition-all duration-200 hover:from-[#0077ed] hover:to-[#2b8dfc] hover:shadow-md",
            collapsed
              ? "aspect-square h-10 w-10 p-0"
              : "w-full gap-2 p-2.5 text-sm font-medium",
          )}
        >
          <PlusCircle className="h-4 w-4 text-white" />
          {!collapsed && <span className="text-white">新的对话</span>}
        </Button>

        {!collapsed && (
          <div className="flex items-center gap-2 px-2 text-sm font-medium text-[#1d1d1f]">
            <Clock className="h-4 w-4 text-[#6e6e73]" />
            <span>历史项目</span>
          </div>
        )}

        {/* projectsLoading || */}
        {isLoadingHistoryProject ? (
          <div className={cn("space-y-2", collapsed ? "mt-2" : "mt-3")}>
            {renderSkeleton()}
          </div>
        ) : !session?.user ? (
          !collapsed && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-3 text-center text-xs font-medium text-blue-800 backdrop-blur">
              <p>登录后可查看历史项目</p>
            </div>
          )
        ) : projects && projects.length > 0 ? (
          <div
            className={cn(
              "scrollbar-thin scrollbar-thumb-[#e5e5e7] scrollbar-thumb-rounded-full scrollbar-track-transparent",
              "max-h-[calc(100vh-150px)] overflow-y-auto pr-1",
              collapsed ? "space-y-3" : "space-y-2",
            )}
          >
            {projects.map((project) => {
              // 检查项目是否被选中
              const isActive = currentProjectId === project.id;

              return (
                <div
                  key={project.id}
                  onClick={() => handleLoadProject(project.id)}
                  className={cn(
                    "group cursor-pointer rounded-xl border backdrop-blur transition-all duration-200",
                    isActive
                      ? "border-[#0071e3] bg-[#f0f7ff] shadow-[0_0_0_1px_#0071e3]"
                      : "border-[#e5e5e7] bg-white/80 hover:border-[#d2d2d7] hover:bg-white hover:shadow-md",
                    collapsed ? "flex items-center justify-center p-2" : "p-3",
                  )}
                >
                  {collapsed ? (
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full",
                        isActive
                          ? "bg-[#0071e3] text-white"
                          : "bg-[#f5f5f7] text-[#86868b]",
                      )}
                    >
                      <History className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h3
                          className={cn(
                            "line-clamp-1 text-sm font-medium",
                            isActive ? "text-[#0071e3]" : "text-[#1d1d1f]",
                          )}
                        >
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#86868b]">
                            {formatDistanceToNow(
                              new Date(project.updatedAt || ""),
                              {
                                addSuffix: true,
                              },
                            )}
                          </span>
                          <ChevronRight
                            className={cn(
                              "h-3.5 w-3.5",
                              isActive
                                ? "text-[#0071e3] opacity-100"
                                : "text-[#86868b] opacity-0 group-hover:opacity-100",
                            )}
                          />
                        </div>
                      </div>

                      {project.description && (
                        <p
                          className={cn(
                            "mt-1.5 line-clamp-1 text-xs",
                            isActive ? "text-[#0071e3]/80" : "text-[#6e6e73]",
                          )}
                        >
                          {project.description}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          !collapsed && (
            <div className="rounded-xl border border-[#e5e5e7] bg-white/80 p-3 text-center text-xs text-[#86868b] backdrop-blur">
              <p>暂无历史项目</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
