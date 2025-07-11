"use client";

import { api } from "@/trpc/react";

// 自定义hook用于获取项目数据
export function useProjectData() {
  // 获取tRPC工具
  const apiUtils = api.useUtils();

  // 创建一个函数来获取单个项目的数据
  const fetchProjectData = async (projectId: string) => {
    if (!apiUtils) throw new Error("API工具不可用");

    const project = await apiUtils.project.getProjectById.fetch({ projectId });
    if (!project) throw new Error("项目不存在");

    const documents = await apiUtils.project.getProjectDocuments.fetch({
      projectId,
    });
    const codeFiles = await apiUtils.project.getProjectCodeFiles.fetch({
      projectId,
    });

    console.log("project", project);
    console.log("documents", documents);
    console.log("codeFiles", codeFiles);

    return { project, documents, codeFiles };
  };

  return { fetchProjectData };
}
