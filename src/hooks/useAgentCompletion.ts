"use client";

import { useAgentStore } from "@/store/agent";
import { useCompletion } from "@ai-sdk/react";
import { useRef, useState } from "react";
import {
  containsExactlyOneHtmlBlock,
  extractFencedCodeBlocks,
  fixTruncatedHtmlBlock,
} from "@/lib/utils";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { DocumentType } from "@prisma/client";

type FileType = "html";

export const useAgentCompletion = () => {
  const {
    setDocument,
    setActiveStep,
    updateCodeForFile,
    setCurrentGeneratingFile,
    codeImplementation,
    setFeedback,
    setIsRegeneratingDocument,
    document,
    setFixedCode,
    setIsFixingCode,
    currentFile,
    requirement,
    setRequirement,
    currentProjectId: storeProjectId,
    setCurrentProjectId: setStoreProjectId,
  } = useAgentStore();

  // 会话状态
  const { data: session } = useSession();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(
    storeProjectId,
  );

  // 使用tRPC接口
  const { mutateAsync: createProject } = api.project.create.useMutation();
  const { mutateAsync: saveDocument } = api.project.saveDocument.useMutation();
  const { mutateAsync: saveCodeFile } = api.project.saveCodeFile.useMutation();

  // 获取项目文档和代码文件的查询
  const { data: projectDocuments } = api.project.getProjectDocuments.useQuery(
    { projectId: currentProjectId ?? "" },
    { enabled: !!currentProjectId },
  );

  const { data: projectCodeFiles } = api.project.getProjectCodeFiles.useQuery(
    { projectId: currentProjectId ?? "" },
    { enabled: !!currentProjectId },
  );

  const apiUtils = api.useUtils();

  // 用于跟踪当前活动文件类型
  const activeFileRef = useRef<FileType>("html");

  // 状态提示
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  // 需求文档生成
  const {
    completion: documentCompletion,
    complete: completeDocument,
    isLoading: isDocumentLoading,
    error: documentError,
  } = useCompletion({
    api: "/api/agents/product-manager",
    onFinish: (prompt, completion) => {
      console.log("documentCompletion", completion);
      setDocument(completion ?? "");
      setActiveStep(2);

      // 如果用户已登录，保存文档
      if (session?.user && completion) {
        setAutoSaveStatus("saving");

        void (async () => {
          try {
            // 创建新项目
            const projectName = `AI生成项目-${new Date().toLocaleDateString()}`;
            const newProject = await createProject({
              name: projectName,
              description: requirement || "AI生成的代码项目",
            });

            const projectId = newProject?.id;
            if (projectId) {
              setCurrentProjectId(projectId);
              console.log("已创建新项目:", projectId);

              // 保存需求文档
              await saveDocument({
                projectId,
                type: DocumentType.REQUIREMENT,
                content: completion,
              });
              console.log("已保存需求文档");

              setAutoSaveStatus("success");
              setTimeout(() => setAutoSaveStatus("idle"), 3000);
            }
          } catch (error) {
            console.error("保存需求文档失败:", error);
            setAutoSaveStatus("error");
            setTimeout(() => setAutoSaveStatus("idle"), 3000);
          }
        })();
      }
    },
  });

  // 代码生成
  const {
    completion: codeCompletion,
    complete: completeCode,
    isLoading: isCodeLoading,
    setCompletion: setCodeCompletion,
  } = useCompletion({
    api: "/api/agents/software-developer",
    onFinish: (prompt, completion) => {
      // 使用ref中存储的当前活动文件类型
      const fileType = activeFileRef.current;

      if (!containsExactlyOneHtmlBlock(completion)) {
        const sourceCode = fixTruncatedHtmlBlock(completion).html;
        void completeContinueCode("", {
          body: {
            requirement: document,
            architectureDoc: "{}",
            sourceCode: sourceCode,
            targetFile: fileType,
          },
        }).catch((error) => {
          console.error("续写代码失败:", error);
        });
        // 将生成的代码设置到相应的文件
        updateCodeForFile(fileType, sourceCode ?? "");
      } else {
        // 将生成的代码设置到相应的文件
        const extractedCode =
          extractFencedCodeBlocks(completion)?.[0]?.code ?? "";
        updateCodeForFile(fileType, extractedCode);

        // 代码生成完成后保存
        if (session?.user && currentProjectId) {
          setAutoSaveStatus("saving");

          void (async () => {
            try {
              // 保存代码文件
              await saveCodeFile({
                projectId: currentProjectId,
                filename: "index.html",
                fileType: "html",
                content: extractedCode,
              });
              console.log("已保存代码文件");

              setAutoSaveStatus("success");
              setTimeout(() => setAutoSaveStatus("idle"), 3000);
            } catch (error) {
              console.error("保存代码文件失败:", error);
              setAutoSaveStatus("error");
              setTimeout(() => setAutoSaveStatus("idle"), 3000);
            }
          })();
        }
      }

      // 完成生成后，清除当前生成状态
      setCurrentGeneratingFile(null);
    },
  });

  // 代码续写
  const {
    completion: continueCodeCompletion,
    complete: completeContinueCode,
    isLoading: isContinueCodeLoading,
    setCompletion: setContinueCodeCompletion,
  } = useCompletion({
    api: "/api/agents/software-developer/continue-code",
    onFinish: (prompt, completion) => {
      const getNewCode = (sourceCode: string) => {
        return (
          sourceCode?.split("\n")?.slice(0, -5)?.join("\n") +
          extractFencedCodeBlocks(completion)?.[0]?.code
        );
      };

      const fileType = activeFileRef.current;
      const currentCodeImplementation =
        useAgentStore.getState().codeImplementation;

      const currentCode = currentCodeImplementation[fileType] ?? "";
      const newCode = getNewCode(currentCode);

      updateCodeForFile(fileType, newCode);

      // 续写代码完成后保存
      if (session?.user && currentProjectId) {
        setAutoSaveStatus("saving");

        void (async () => {
          try {
            // 保存更新后的代码文件
            await saveCodeFile({
              projectId: currentProjectId,
              filename: "index.html",
              fileType: "html",
              content: newCode,
            });
            console.log("已保存续写的代码文件");

            setAutoSaveStatus("success");
            setTimeout(() => setAutoSaveStatus("idle"), 3000);
          } catch (error) {
            console.error("保存续写代码失败:", error);
            setAutoSaveStatus("error");
            setTimeout(() => setAutoSaveStatus("idle"), 3000);
          }
        })();
      }
    },
  });

  // 代码修复
  const {
    completion: codeFixCompletion,
    complete: completeCodeFix,
    isLoading: isCodeFixLoading,
    setCompletion: setCodeFixCompletion,
  } = useCompletion({
    api: "/api/agents/software-developer/fix-code",
    onFinish: (prompt, completion) => {
      // 解析修复后的代码差异
      const diffMatch = /<diff>([\s\S]*?)<\/diff>/;
      const diffContent = diffMatch.exec(completion)?.[1]?.trim();

      if (diffContent) {
        setFixedCode(diffContent);

        // 如果有修复内容，保存修复状态
        if (session?.user && currentProjectId) {
          setAutoSaveStatus("saving");

          void (async () => {
            try {
              // 保存代码审查文档
              await saveDocument({
                projectId: currentProjectId,
                type: DocumentType.CODE_REVIEW,
                content: `修复建议:\n${diffContent}`,
              });
              console.log("已保存代码修复建议");

              setAutoSaveStatus("success");
              setTimeout(() => setAutoSaveStatus("idle"), 3000);
            } catch (error) {
              console.error("保存代码修复建议失败:", error);
              setAutoSaveStatus("error");
              setTimeout(() => setAutoSaveStatus("idle"), 3000);
            }
          })();
        }
      }
      setIsFixingCode(false);
    },
  });

  // 加载历史项目数据
  const loadProject = async (projectId: string) => {
    if (!session?.user) return;

    setAutoSaveStatus("saving");
    setCurrentProjectId(projectId);
    setStoreProjectId(projectId);

    try {
      if (!apiUtils) {
        console.error("无法获取API工具");
        return;
      }

      // 定义用于获取项目数据的函数
      const fetchProjectData = async (projectId: string) => {
        // 获取项目详情
        const project = await apiUtils.project.getProjectById.fetch({
          projectId,
        });
        if (!project) throw new Error("项目不存在");

        // 获取项目文档
        const docs = await apiUtils.project.getProjectDocuments.fetch({
          projectId,
        });

        // 获取项目代码文件
        const codeFiles = await apiUtils.project.getProjectCodeFiles.fetch({
          projectId,
        });

        // 将获取的数据转换为 loadProjectData 需要的格式
        return {
          project: {
            id: project.id,
            description: project.description,
          },
          documents: docs.map((doc) => ({
            type: doc.type,
            content: doc.content,
          })),
          codeFiles: codeFiles.map((file) => ({
            fileType: file.fileType,
            content: file.content,
            isLatest: file.isLatest,
          })),
        };
      };

      // 使用 agent store 中的 loadProjectData 方法
      const { loadProjectData } = useAgentStore.getState();
      await loadProjectData(projectId, fetchProjectData);

      setAutoSaveStatus("success");
      setTimeout(() => setAutoSaveStatus("idle"), 3000);
    } catch (error: unknown) {
      console.error(
        "加载项目数据失败:",
        error instanceof Error ? error.message : String(error),
      );
      setAutoSaveStatus("error");
      setTimeout(() => setAutoSaveStatus("idle"), 3000);
    }
  };

  // 处理需求文档生成
  const handleGenerateDocument = async (
    requirement: string,
    feedback?: string,
  ) => {
    console.log("requirement", requirement);
    console.log("feedback", feedback);

    if (feedback) {
      setIsRegeneratingDocument(true);
      try {
        await completeDocument(requirement, {
          body: {
            feedback,
            originalPRD: document,
          },
        });
        setFeedback("");
      } catch (error) {
        console.error("重新生成文档失败:", error);
      } finally {
        setIsRegeneratingDocument(false);
      }
    } else {
      await completeDocument(requirement);
    }
  };

  // 处理代码生成
  const handleGenerateCode = async (fileType: FileType) => {
    activeFileRef.current = fileType;
    setCurrentGeneratingFile(fileType);

    const otherCode: Record<string, string> = {};
    Object.entries(codeImplementation).forEach(([key, value]) => {
      if (key !== fileType) {
        otherCode[key] = value ?? "";
      } else {
        otherCode[key] = "";
      }
    });

    await completeCode("", {
      body: {
        requirement: document,
        architectureDoc: "{}",
        history: otherCode,
        targetFile: fileType,
      },
    });
  };

  // 处理代码修复
  const handleFixCode = async (issueDescription: string) => {
    if (!codeImplementation.html || !document) return;

    setIsFixingCode(true);
    await completeCodeFix("", {
      body: {
        requirement: document,
        sourceCode: codeImplementation.html ?? "",
        issueDescription: issueDescription,
      },
    });
  };

  return {
    // 文档生成
    documentCompletion,
    isDocumentLoading,
    documentError,
    handleGenerateDocument,

    // 代码生成
    codeCompletion,
    isCodeLoading,
    handleGenerateCode,
    setCodeCompletion,

    // 代码续写
    continueCodeCompletion,
    isContinueCodeLoading,
    setContinueCodeCompletion,

    // 代码修复
    codeFixCompletion,
    isCodeFixLoading,
    handleFixCode,

    // 当前正在处理的文件
    activeFileRef,

    // 数据持久化
    currentProjectId,
    autoSaveStatus,

    // 加载历史项目
    loadProject,
  };
};
