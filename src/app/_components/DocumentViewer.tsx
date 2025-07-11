"use client";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DocumentTextIcon,
  ClipboardIcon,
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
  ArrowPathIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import type { CommonProps } from "./types";

interface DocumentViewerProps {
  document: string | null;
  documentCompletion: string;
  isDocumentLoading: boolean;
  requirement: string;
  feedback: string;
  copiedText: string;
  isRegeneratingDocument: boolean;
  isCodeLoading: boolean;
  isContinueCodeLoading: boolean;
  documentContainerRef: CommonProps["documentContainerRef"];
  handleCopyText: CommonProps["handleCopyText"];
  setFeedback: (feedback: string) => void;
  handleGenerateDocument: CommonProps["handleGenerateDocument"];
  handleGenerateCode: CommonProps["handleGenerateCode"];
}

export const DocumentViewer = ({
  document,
  documentCompletion,
  isDocumentLoading,
  requirement,
  feedback,
  copiedText,
  isRegeneratingDocument,
  isCodeLoading,
  isContinueCodeLoading,
  documentContainerRef,
  handleCopyText,
  setFeedback,
  handleGenerateDocument,
  handleGenerateCode,
}: DocumentViewerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-[#e6e6e6] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:p-6"
    >
      <div className="mb-3 flex items-center space-x-2 sm:mb-4">
        <DocumentTextIcon className="h-4 w-4 text-[#0071e3] sm:h-5 sm:w-5" />
        <h3 className="text-base font-medium text-[#1d1d1f] sm:text-lg">
          需求文档
        </h3>
      </div>
      <div className="relative">
        <div
          ref={documentContainerRef}
          className="prose prose-blue max-h-64 overflow-y-auto rounded-xl border border-[#e6e6e6] bg-[#fafafa] p-3 text-sm text-[#1d1d1f] sm:max-h-80 sm:p-5 sm:text-base"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {isDocumentLoading ? documentCompletion : (document ?? "")}
          </ReactMarkdown>
        </div>
        {document && (
          <motion.button
            onClick={() => handleCopyText(document ?? "", "document")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-3 right-3 rounded-full bg-white/90 p-1.5 backdrop-blur transition-colors hover:bg-[#f5f5f7] sm:p-2"
            title="复制文档"
          >
            {copiedText === "document" ? (
              <span className="text-xs font-medium text-[#0071e3]">
                已复制!
              </span>
            ) : (
              <ClipboardIcon className="h-3.5 w-3.5 text-[#0071e3] sm:h-4 sm:w-4" />
            )}
          </motion.button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mt-4 space-y-3 sm:mt-5"
      >
        <div className="flex items-center space-x-2">
          <ChatBubbleBottomCenterTextIcon className="h-4 w-4 text-[#0071e3] sm:h-5 sm:w-5" />
          <label
            htmlFor="feedback"
            className="text-sm font-medium text-[#1d1d1f] sm:text-base"
          >
            需求反馈
          </label>
        </div>

        <div className="relative">
          <textarea
            id="feedback"
            placeholder="请提供您对需求的修改建议，AI将根据您的反馈重新生成..."
            rows={3}
            className="w-full resize-none rounded-xl border border-[#d2d2d7] bg-[#fafafa] p-3 text-sm text-[#1d1d1f] transition-all duration-200 focus:border-[#0071e3] focus:bg-white focus:ring-0 focus:outline-none sm:p-4 sm:text-base"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <AnimatePresence>
            {feedback && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setFeedback("")}
                className="absolute top-3 right-3 rounded-full bg-[#e6e6e6] p-1 text-[#86868b] transition-colors hover:bg-[#d2d2d7] hover:text-[#1d1d1f]"
                title="清除反馈"
              >
                <XMarkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ y: -2, backgroundColor: "#f5f5f7" }}
            whileTap={{ y: 0 }}
            className="flex flex-1 items-center justify-center space-x-1.5 rounded-xl border border-[#d2d2d7] bg-white px-4 py-2.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] disabled:opacity-50 sm:py-3"
            onClick={() => setFeedback("")}
            disabled={isRegeneratingDocument || !feedback.trim()}
          >
            <ArrowUturnLeftIcon className="h-3.5 w-3.5 text-[#86868b] sm:h-4 sm:w-4" />
            <span>重置反馈</span>
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            className="flex flex-1 items-center justify-center space-x-1.5 rounded-xl bg-[#0071e3] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0077ed] active:bg-[#006edb] disabled:opacity-50 sm:py-3"
            onClick={() => handleGenerateDocument(requirement, feedback)}
            disabled={isRegeneratingDocument || !feedback.trim()}
          >
            {isRegeneratingDocument ? (
              <span className="flex items-center">
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                重新生成中...
              </span>
            ) : (
              <>
                <ArrowPathIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>重新生成文档</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:mt-6">
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ y: 1 }}
          className="w-full"
        >
          <Button
            className={`w-full rounded-xl py-2 text-sm transition-all duration-200 sm:py-2.5 sm:text-base ${
              isCodeLoading || isContinueCodeLoading
                ? "bg-[#e8f0fd] text-[#0071e3]"
                : "bg-[#0071e3] text-white hover:bg-[#0077ed]"
            }`}
            onClick={() => handleGenerateCode("html")}
            disabled={isCodeLoading || isContinueCodeLoading}
          >
            {isCodeLoading || isContinueCodeLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin sm:mr-2 sm:h-4 sm:w-4" />
                生成中...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <CodeBracketIcon className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                生成HTML
                <div></div>
              </span>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
