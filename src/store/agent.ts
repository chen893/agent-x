import { create } from "zustand";
import { api } from "@/trpc/react";
import { useCompletion } from "@ai-sdk/react";
import {
  containsExactlyOneHtmlBlock,
  extractFencedCodeBlocks,
  fixTruncatedHtmlBlock,
} from "@/lib/utils";
import * as FileSaver from "file-saver";

type FileType = "html";

// 项目类型定义
interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 文档类型定义
interface Document {
  id: string;
  type: string;
  content: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 代码文件类型定义
interface CodeFile {
  id: string;
  filename: string;
  fileType: string;
  content: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  isLatest: boolean;
  versionNum: number;
}

interface AgentState {
  // 状态
  requirement: string;
  document: string;
  codeImplementation: Record<string, string>;
  currentFile: FileType;
  copiedText: string | null;
  activeStep: number;
  isGeneratingAll: boolean;
  currentGeneratingFile: FileType | null;
  feedback: string;
  isRegeneratingDocument: boolean;
  isReviewMode: boolean;
  issueDescription: string;
  isFixingCode: boolean;
  fixedCode: string | null;
  isApplyingFix: boolean;

  // 历史项目状态
  currentProjectId: string | null;
  isLoadingHistoryProject: boolean;
  isLoadingCurrentProject: boolean;

  // 动作
  setRequirement: (requirement: string) => void;
  setDocument: (document: string) => void;
  setCodeImplementation: (codeImplementation: Record<string, string>) => void;
  updateCodeForFile: (fileType: FileType, code: string) => void;
  setCurrentFile: (currentFile: FileType) => void;
  setCopiedText: (copiedText: string | null) => void;
  setActiveStep: (activeStep: number) => void;
  setIsGeneratingAll: (isGeneratingAll: boolean) => void;
  setCurrentGeneratingFile: (currentGeneratingFile: FileType | null) => void;
  setFeedback: (feedback: string) => void;
  setIsRegeneratingDocument: (isRegeneratingDocument: boolean) => void;
  resetFeedback: () => void;
  setIsReviewMode: (isReviewMode: boolean) => void;
  setIssueDescription: (issueDescription: string) => void;
  setIsFixingCode: (isFixingCode: boolean) => void;
  setFixedCode: (fixedCode: string | null) => void;
  setIsApplyingFix: (isApplyingFix: boolean) => void;

  // 历史项目相关方法
  setCurrentProjectId: (projectId: string | null) => void;
  setIsLoadingHistoryProject: (isLoading: boolean) => void;
  setIsLoadingCurrentProject: (isLoading: boolean) => void;

  loadProjectData: (
    projectId: string,
    fetchFn: (projectId: string) => Promise<{
      project: { id: string; description: string | null };
      documents: Array<{ type: string; content: string }>;
      codeFiles: Array<{
        fileType: string;
        content: string;
        isLatest: boolean;
      }>;
    }>,
  ) => Promise<void>;
  resetToNewProject: () => void;

  // 业务逻辑
  handleCopyText: (text: string, id: string) => void;
  handleDownload: () => Promise<void>;
  parseFixBlocks: (
    diffContent: string,
  ) => Array<{ search: string; replace: string }>;
  clearCode: () => void;
  handleCodeReview: () => void;
  handleCancelFix: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  // 初始状态
  requirement: "",
  document: "",
  codeImplementation: { html: "" },
  currentFile: "html",
  copiedText: null,
  activeStep: 1,
  isGeneratingAll: false,
  currentGeneratingFile: null,
  feedback: "",
  isRegeneratingDocument: false,
  isReviewMode: false,
  issueDescription: "",
  isFixingCode: false,
  fixedCode: null,
  isApplyingFix: false,

  // 历史项目状态
  currentProjectId: null,
  isLoadingHistoryProject: false,

  // 当前project 加载状态
  isLoadingCurrentProject: false,

  // 设置函数
  setRequirement: (requirement) => set({ requirement }),
  setDocument: (document) => set({ document }),
  setCodeImplementation: (codeImplementation) => set({ codeImplementation }),
  updateCodeForFile: (fileType, code) =>
    set((state) => ({
      codeImplementation: {
        ...state.codeImplementation,
        [fileType]: code,
      },
    })),
  setCurrentFile: (currentFile) => set({ currentFile }),
  setCopiedText: (copiedText) => set({ copiedText }),
  setActiveStep: (activeStep) => set({ activeStep }),
  setIsGeneratingAll: (isGeneratingAll) => set({ isGeneratingAll }),
  setCurrentGeneratingFile: (currentGeneratingFile) =>
    set({ currentGeneratingFile }),
  setFeedback: (feedback) => set({ feedback }),
  setIsRegeneratingDocument: (isRegeneratingDocument) =>
    set({ isRegeneratingDocument }),
  resetFeedback: () => set({ feedback: "" }),
  setIsReviewMode: (isReviewMode) => set({ isReviewMode }),
  setIssueDescription: (issueDescription) => set({ issueDescription }),
  setIsFixingCode: (isFixingCode) => set({ isFixingCode }),
  setFixedCode: (fixedCode) => set({ fixedCode }),
  setIsApplyingFix: (isApplyingFix) => set({ isApplyingFix }),

  // 历史项目相关方法
  setCurrentProjectId: (projectId) => set({ currentProjectId: projectId }),
  setIsLoadingHistoryProject: (isLoading) =>
    set({ isLoadingHistoryProject: isLoading }),

  // 当前project 加载状态
  setIsLoadingCurrentProject: (isLoading) =>
    set({ isLoadingCurrentProject: isLoading }),

  loadProjectData: async (projectId, fetchFn) => {
    const {
      setCurrentProjectId,
      setRequirement,
      setDocument,
      updateCodeForFile,
      setActiveStep,
      setIsLoadingCurrentProject,
    } = get();

    try {
      setIsLoadingCurrentProject(true);

      // setIsLoadingHistoryProject(true);

      // 使用传入的函数获取数据
      const { project, documents, codeFiles } = await fetchFn(projectId);

      if (!project) throw new Error("项目不存在");

      // 设置项目ID
      setCurrentProjectId(projectId);

      // 处理需求文档
      const requirementDoc = documents?.find(
        (doc) => doc.type === "REQUIREMENT",
      );

      if (requirementDoc) {
        setDocument(requirementDoc.content);
        setRequirement(project.description ?? "");
        setActiveStep(2); // 设置步骤到文档已生成
      }

      // 处理代码文件
      const htmlFile = codeFiles?.find(
        (file) => file.fileType === "html" && file.isLatest,
      );

      if (htmlFile) {
        updateCodeForFile("html", htmlFile.content);
        setActiveStep(3);
      }
    } catch (error) {
      console.error("加载项目数据失败:", error);
    } finally {
      // setIsLoadingHistoryProject(false);
      setIsLoadingCurrentProject(false);
    }
  },

  resetToNewProject: () => {
    set({
      requirement: "",
      document: "",
      codeImplementation: { html: "" },
      currentFile: "html",
      activeStep: 1,
      currentProjectId: null,
      isReviewMode: false,
      issueDescription: "",
      fixedCode: null,
      isFixingCode: false,
    });
  },

  // 业务逻辑
  handleCopyText: (text, id) => {
    try {
      void navigator.clipboard
        .writeText(text)
        .then(() => {
          set({ copiedText: id });
          setTimeout(() => set({ copiedText: null }), 2000);
        })
        .catch((error) => {
          console.error("复制失败:", error);
        });
    } catch (error) {
      console.error("复制操作异常:", error);
    }
  },

  handleDownload: async () => {
    try {
      const { codeImplementation } = get();
      const htmlContent = codeImplementation.html ?? "";
      const blob = new Blob([htmlContent], { type: "text/html" });
      FileSaver.saveAs(blob, "index.html");
    } catch (error) {
      console.error("下载文件失败:", error);
    }
  },

  parseFixBlocks: (diffContent) => {
    if (!diffContent || typeof diffContent !== "string") {
      console.error("无效的修复内容");
      return [];
    }

    const fixes: { search: string; replace: string }[] = [];
    try {
      const regex =
        /<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> REPLACE/g;

      let match;
      while ((match = regex.exec(diffContent)) !== null) {
        if (match[1] && match[2]) {
          fixes.push({
            search: match[1],
            replace: match[2],
          });
        }
      }
    } catch (error) {
      console.error("解析修复块时出错:", error);
    }

    return fixes;
  },

  clearCode: () => {
    set({
      codeImplementation: { html: "" },
      fixedCode: null,
      isReviewMode: false,
      issueDescription: "",
    });
  },

  handleCodeReview: () => {
    set({
      isReviewMode: true,
      issueDescription:
        "请帮我检查代码中可能存在的问题，包括功能、性能的问题，确保能正常运行。",
    });
  },

  handleCancelFix: () => {
    set({
      fixedCode: null,
      isReviewMode: false,
      issueDescription: "",
      isFixingCode: false,
    });
  },
}));
