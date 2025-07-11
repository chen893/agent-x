"use client";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CodeBracketIcon,
  ClipboardIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeReview } from "./CodeReview";
import type { CommonProps } from "./types";

interface CodeImplementationProps {
  codeImplementation: Record<string, string>;
  currentFile: string;
  currentCode: string | null | undefined;
  isCodeLoading: boolean;
  isContinueCodeLoading: boolean;
  isReviewMode: boolean;
  copiedText: string;
  isFixingCode: boolean;
  fixedCode: string | null;
  issueDescription: CommonProps["issueDescription"];
  isApplyingFix: boolean;
  codeFixCompletion: string;
  codeContainerRef: CommonProps["codeContainerRef"];
  handleCopyText: CommonProps["handleCopyText"];
  handleDownload: () => void;
  clearAllCode: () => void;
  handleCodeReview: () => void;
  setIssueDescription: CommonProps["setIssueDescription"];
  handleCancelFix: () => void;
  handleFixCode: CommonProps["handleFixCode"];
  handleApplyFix: () => void;
}

export const CodeImplementation = ({
  codeImplementation,
  currentFile,
  currentCode,
  isCodeLoading,
  isContinueCodeLoading,
  isReviewMode,
  copiedText,
  isFixingCode,
  fixedCode,
  issueDescription,
  isApplyingFix,
  codeFixCompletion,
  codeContainerRef,
  handleCopyText,
  handleDownload,
  clearAllCode,
  handleCodeReview,
  setIssueDescription,
  handleCancelFix,
  handleFixCode,
  handleApplyFix,
}: CodeImplementationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-[#e6e6e6] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:p-6"
    >
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <div className="flex items-center space-x-2">
          <CodeBracketIcon className="h-4 w-4 text-[#0071e3] sm:h-5 sm:w-5" />
          <h3 className="text-base font-medium text-[#1d1d1f] sm:text-lg">
            代码实现
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {!isReviewMode && !isFixingCode && (
            <Button
              variant="outline"
              onClick={handleCodeReview}
              className="flex items-center space-x-1 rounded-lg border-[#e6e6e6] px-2 py-1 text-xs text-[#0071e3] hover:bg-[#f5f5f7] hover:text-[#0071e3] sm:px-3 sm:py-1 sm:text-sm"
              disabled={isCodeLoading || isContinueCodeLoading}
            >
              <ShieldCheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>代码审查</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={clearAllCode}
            className="rounded-lg border-[#e6e6e6] px-2 py-1 text-xs text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] sm:px-3 sm:py-1 sm:text-sm"
          >
            清空代码
          </Button>
        </div>
      </div>

      {/* 代码修复反馈区域 */}
      <AnimatePresence>
        {isReviewMode && (
          <CodeReview
            isReviewMode={isReviewMode}
            fixedCode={fixedCode}
            issueDescription={issueDescription ?? ""}
            isFixingCode={isFixingCode}
            isApplyingFix={isApplyingFix}
            codeFixCompletion={codeFixCompletion}
            setIssueDescription={setIssueDescription}
            handleCancelFix={handleCancelFix}
            handleFixCode={handleFixCode}
            handleApplyFix={handleApplyFix}
          />
        )}
      </AnimatePresence>

      <Tabs defaultValue="html" className="w-full">
        <TabsList className="mb-3 grid grid-cols-1 gap-1 rounded-xl bg-[#f5f5f7] p-1 sm:mb-4">
          <TabsTrigger
            value="html"
            className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#0071e3] data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.05)] sm:text-sm"
          >
            HTML
          </TabsTrigger>
        </TabsList>

        {Object.entries(codeImplementation).map(([key, value]) => (
          <TabsContent key={key} value={key} className="mt-0">
            <div className="relative">
              <div
                ref={codeContainerRef}
                className="max-h-72 overflow-y-auto rounded-xl border border-[#e6e6e6] bg-[#fafafa] p-3 font-mono text-xs whitespace-pre-wrap text-[#1d1d1f] sm:max-h-96 sm:p-5 sm:text-sm"
              >
                {currentFile === key && (isCodeLoading || isContinueCodeLoading)
                  ? (currentCode ?? "代码生成中...")
                  : (value ?? "暂无代码")}
              </div>
              <motion.button
                onClick={() => handleCopyText(value, `code-${key}`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-3 right-3 rounded-full bg-white/90 p-1.5 backdrop-blur transition-colors hover:bg-[#f5f5f7] sm:p-2"
                title="复制代码"
              >
                {copiedText === `code-${key}` ? (
                  <span className="text-xs font-medium text-[#0071e3]">
                    已复制!
                  </span>
                ) : (
                  <ClipboardIcon className="h-3.5 w-3.5 text-[#0071e3] sm:h-4 sm:w-4" />
                )}
              </motion.button>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Button
        className="mt-3 w-full rounded-xl bg-[#0071e3] py-2 text-sm text-white transition-colors hover:bg-[#0077ed] active:bg-[#006edb] sm:mt-4 sm:py-2.5 sm:text-base"
        onClick={handleDownload}
        variant="secondary"
      >
        <ArrowDownTrayIcon className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
        下载HTML文件
      </Button>
    </motion.div>
  );
};
