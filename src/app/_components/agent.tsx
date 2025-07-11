"use client";
import { useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentStore } from "@/store/agent";
import { useAgentCompletion } from "@/hooks/useAgentCompletion";
import { RequirementInput } from "./RequirementInput";
import { DocumentViewer } from "./DocumentViewer";
import { CodeImplementation } from "./CodeImplementation";
import { CodePreviewSection } from "./CodePreviewSection";
import type { FileType } from "./types";
import { useSession } from "next-auth/react";
import { constructNewFileContentV2 } from "@/lib/diff";
// import { Button } from "@/components/ui/button";

export const Agent = () => {
  // 从状态库获取状态
  const {
    requirement,
    setRequirement,
    document,
    codeImplementation,
    currentFile,
    copiedText,
    activeStep,
    feedback,
    isRegeneratingDocument,
    isReviewMode,
    issueDescription,
    isFixingCode,
    fixedCode,
    isApplyingFix,
    setFeedback,
    setIsReviewMode,
    setIssueDescription,
    setIsFixingCode,
    setFixedCode,
    setIsApplyingFix,
    handleCopyText,
    handleDownload,
    parseFixBlocks,
    clearCode,
    handleCodeReview,
    handleCancelFix,
    updateCodeForFile,
    isLoadingCurrentProject,
  } = useAgentStore();

  // 会话状态
  const { data: session } = useSession();

  // 使用自定义hook获取API交互逻辑
  const {
    documentCompletion,
    isDocumentLoading,
    documentError: error,
    handleGenerateDocument,
    isCodeLoading,
    isContinueCodeLoading,
    handleGenerateCode,
    handleFixCode,
    codeCompletion,
    setCodeCompletion,
    continueCodeCompletion,
    setContinueCodeCompletion,
    activeFileRef,
    codeFixCompletion,
    // saveProjectData,
    currentProjectId,
    autoSaveStatus,
  } = useAgentCompletion();

  const clearAllCode = () => {
    clearCode();
    setCodeCompletion("");
    setContinueCodeCompletion("");
  };

  // 添加引用来获取滚动容器
  const documentContainerRef = useRef<HTMLDivElement>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  // 添加自动滚动效果，确保文档内容始终滚动到最新位置
  useEffect(() => {
    if (documentContainerRef.current && document) {
      const container = documentContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [document]);

  // 添加自动滚动效果，确保代码内容始终滚动到最新位置
  useEffect(() => {
    if (
      codeContainerRef.current &&
      currentFile === activeFileRef.current &&
      (isCodeLoading ||
        isContinueCodeLoading ||
        codeImplementation[currentFile])
    ) {
      const container = codeContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [
    codeImplementation,
    codeCompletion,
    continueCodeCompletion,
    currentFile,
    isCodeLoading,
    isContinueCodeLoading,
    activeFileRef,
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequirement(e.target.value);
  };

  // 应用修复
  const handleApplyFix = async () => {
    if (!fixedCode) return;

    setIsApplyingFix(true);

    try {
      // 解析和应用所有的修复块
      console.log("fixCode", fixedCode);
      // console.log("codeImplementation", codeImplementation.html);
      // console.log('')

      const blocks = fixedCode
        .split("------- SEARCH\n")
        .filter((item) => item !== "")
        .map((item) => "------- SEARCH\n" + item);

      let result = codeImplementation.html ?? "";

      for (const block of blocks) {
        result = await constructNewFileContentV2(block, result, true);
      }

      let updatedCode = result ?? codeImplementation.html ?? "";
      // Check if result is an object with replacements (new format)
      if (
        typeof result === "object" &&
        result !== null &&
        "replacements" in result
      ) {
        updatedCode = (result as { replacements: string })?.replacements ?? "";
      }
      // const fixes = parseFixBlocks(fixedCode);
      // console.log("fixes", fixes);

      // if (fixes.length === 0) {
      //   console.warn("未找到有效的修复");
      //   setIsApplyingFix(false);
      //   return;
      // }

      // let updatedCode = codeImplementation.html ?? "";

      // // 改进替换逻辑，使用更精确的替换
      // for (const fix of fixes) {
      //   // 使用正则表达式进行精确替换，escape特殊字符
      //   const searchRegex = new RegExp(
      //     fix.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      //     "g",
      //   );
      //   updatedCode = updatedCode.replace(searchRegex, fix.replace);
      // }

      // 更新代码
      updateCodeForFile("html", updatedCode);

      // 重置修复状态
      setFixedCode(null);
      setIsReviewMode(false);
      setIssueDescription("");
    } catch (error) {
      console.error("应用修复失败:", error);
    } finally {
      setIsApplyingFix(false);
      setIsFixingCode(false);
    }
  };

  // 正在生成的代码，结合了codeCompletion和continueCodeCompletion
  const currentCode = (() => {
    if (!continueCodeCompletion) {
      // 防止codeCompletion为空或不包含```html
      const parts = codeCompletion?.split("```html") ?? [];
      return parts.length > 1 ? parts[1] : (codeCompletion ?? "");
    }

    // 防止解析错误并确保安全的字符串拼接
    const codeParts =
      codeCompletion?.split("\n")?.slice(0, -5)?.join("\n") ?? "";
    const continueParts = continueCodeCompletion?.split("```html") ?? [];
    const continueCode =
      continueParts.length > 1
        ? continueParts[1]
        : (continueCodeCompletion ?? "");

    return codeParts + continueCode;
  })();

  // 函数包装器，处理类型兼容性问题
  const handleGenerateCodeWrapper = (type: string) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleGenerateCode(type as FileType);
  };

  const handleCopyTextWrapper = (
    text: string | null | undefined,
    type: string,
  ) => {
    handleCopyText(text ?? "", type);
  };

  // 自动保存状态提示
  const renderAutoSaveStatus = () => {
    if (!session?.user) return null;

    switch (autoSaveStatus) {
      case "saving":
        return <span className="ml-1 text-[#0071e3]">（正在保存...）</span>;
      case "success":
        return <span className="ml-1 text-green-600">（保存成功）</span>;
      case "error":
        return (
          <span className="ml-1 text-red-500">（保存失败，将自动重试）</span>
        );
      default:
        return <span className="ml-1 text-[#0071e3]">（已启用自动保存）</span>;
    }
  };

  // 如果正在加载当前项目，显示加载状态
  if (isLoadingCurrentProject) {
    return (
      <div className="relative min-h-screen w-full bg-gradient-to-br from-[#f5f5f7] to-[#fbfbfd] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        {/* 背景装饰元素 */}
        <div className="pointer-events-none absolute top-[10%] left-[5%] h-48 w-48 rounded-full bg-[#0071e3]/5 blur-3xl"></div>
        <div className="pointer-events-none absolute right-[10%] bottom-[15%] h-60 w-60 rounded-full bg-[#0071e3]/5 blur-3xl"></div>

        <Card className="mx-auto w-full overflow-hidden rounded-2xl border-none bg-white shadow-[0_0_20px_rgba(0,0,0,0.08)] sm:my-8 md:max-w-5xl lg:max-w-6xl">
          <CardContent className="flex min-h-[400px] items-center justify-center p-8">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-[#0071e3] border-t-transparent"
              />
              <h3 className="mb-2 text-lg font-medium text-[#1d1d1f]">
                正在加载项目
              </h3>
              <p className="text-sm text-[#86868b]">
                请稍候，正在初始化您的项目数据...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#f5f5f7] to-[#fbfbfd] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
      {/* 背景装饰元素 */}
      <div className="pointer-events-none absolute top-[10%] left-[5%] h-48 w-48 rounded-full bg-[#0071e3]/5 blur-3xl"></div>
      <div className="pointer-events-none absolute right-[10%] bottom-[15%] h-60 w-60 rounded-full bg-[#0071e3]/5 blur-3xl"></div>

      <Card className="mx-auto w-full overflow-hidden rounded-2xl border-none bg-white shadow-[0_0_20px_rgba(0,0,0,0.08)] sm:my-8 md:max-w-5xl lg:max-w-6xl">
        <CardHeader className="border-b bg-gradient-to-r from-[#f7f7f7] to-[#fcfcfc] px-4 pt-8 pb-6 sm:px-8">
          <CardTitle className="text-center text-xl font-medium text-[#1d1d1f] sm:text-2xl">
            AI代码生成助手
          </CardTitle>

          <CardDescription className="text-center text-sm text-[#86868b] sm:text-base">
            输入您的项目需求，我们将为您生成详细的需求文档、架构设计和代码实现
            {renderAutoSaveStatus()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-4 sm:space-y-8 sm:p-6 md:p-8">
          {/* 步骤进度条 */}
          <div className="mb-6 flex items-center space-x-2 px-2 sm:mb-8 sm:space-x-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{
                scale: activeStep >= 1 ? 1 : 0.9,
                opacity: activeStep >= 1 ? 1 : 0.8,
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium sm:h-9 sm:w-9 ${activeStep >= 1 ? "bg-[#0071e3] text-white" : "bg-[#f5f5f7] text-[#86868b]"}`}
            >
              1
            </motion.div>
            <div
              className={`h-0.5 flex-1 transition-colors duration-300 ${activeStep >= 2 ? "bg-[#0071e3]" : "bg-[#e6e6e6]"}`}
            ></div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{
                scale: activeStep >= 2 ? 1 : 0.9,
                opacity: activeStep >= 2 ? 1 : 0.8,
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium sm:h-9 sm:w-9 ${activeStep >= 2 ? "bg-[#0071e3] text-white" : "bg-[#f5f5f7] text-[#86868b]"}`}
            >
              2
            </motion.div>
          </div>

          {/* 需求输入部分 */}
          <RequirementInput
            requirement={requirement}
            isDocumentLoading={isDocumentLoading}
            handleChange={handleChange}
            handleGenerateDocument={handleGenerateDocument}
          />

          {/* 需求文档部分 */}
          <AnimatePresence>
            {(document ?? (isDocumentLoading || documentCompletion)) && (
              <DocumentViewer
                document={document}
                documentCompletion={documentCompletion}
                isDocumentLoading={isDocumentLoading}
                requirement={requirement}
                feedback={feedback}
                copiedText={copiedText ?? ""}
                isRegeneratingDocument={isRegeneratingDocument}
                isCodeLoading={isCodeLoading}
                isContinueCodeLoading={isContinueCodeLoading}
                documentContainerRef={documentContainerRef}
                handleCopyText={handleCopyTextWrapper}
                setFeedback={setFeedback}
                handleGenerateDocument={handleGenerateDocument}
                handleGenerateCode={handleGenerateCodeWrapper}
              />
            )}
          </AnimatePresence>

          {/* 代码实现部分 */}
          <AnimatePresence>
            {
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              (codeImplementation.html ||
                (codeCompletion &&
                  (isCodeLoading || isContinueCodeLoading))) && (
                <CodeImplementation
                  codeImplementation={codeImplementation}
                  currentFile={currentFile}
                  currentCode={currentCode}
                  isCodeLoading={isCodeLoading}
                  isContinueCodeLoading={isContinueCodeLoading}
                  isReviewMode={isReviewMode}
                  copiedText={copiedText ?? ""}
                  isFixingCode={isFixingCode}
                  fixedCode={fixedCode}
                  issueDescription={issueDescription}
                  isApplyingFix={isApplyingFix}
                  codeFixCompletion={codeFixCompletion}
                  codeContainerRef={codeContainerRef}
                  handleCopyText={handleCopyTextWrapper}
                  handleDownload={handleDownload}
                  clearAllCode={clearAllCode}
                  handleCodeReview={handleCodeReview}
                  setIssueDescription={setIssueDescription}
                  handleCancelFix={handleCancelFix}
                  handleFixCode={handleFixCode}
                  handleApplyFix={handleApplyFix}
                />
              )
            }
          </AnimatePresence>

          {/* 代码预览部分 */}
          <AnimatePresence>
            {codeImplementation.html &&
              !isCodeLoading &&
              !isContinueCodeLoading && (
                <CodePreviewSection html={codeImplementation.html} />
              )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* 底部装饰元素 */}
      <div className="pointer-events-none fixed bottom-0 left-0 hidden h-32 w-full bg-gradient-to-t from-[#f5f5f7]/50 to-transparent sm:block"></div>
    </div>
  );
};
