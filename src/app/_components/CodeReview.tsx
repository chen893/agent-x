"use client";
import { Button } from "@/components/ui/button";
import {
  ExclamationCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface CodeReviewProps {
  isReviewMode: boolean;
  fixedCode: string | null;
  issueDescription: string;
  isFixingCode: boolean;
  isApplyingFix: boolean;
  codeFixCompletion: string;
  setIssueDescription: (description: string) => void;
  handleCancelFix: () => void;
  handleFixCode: (description: string) => void;
  handleApplyFix: () => void;
}

export const CodeReview = ({
  isReviewMode,
  fixedCode,
  issueDescription,
  isFixingCode,
  isApplyingFix,
  codeFixCompletion,
  setIssueDescription,
  handleCancelFix,
  handleFixCode,
  handleApplyFix,
}: CodeReviewProps) => {
  if (!isReviewMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4 overflow-hidden"
    >
      <div className="rounded-xl border border-[#e6e6e6] bg-[#f8f8fa] p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ExclamationCircleIcon className="h-4 w-4 text-[#0071e3] sm:h-5 sm:w-5" />
            <h4 className="text-sm font-medium text-[#1d1d1f] sm:text-base">
              {fixedCode ? "检测到问题" : "问题描述"}
            </h4>
          </div>
          <Button
            variant="ghost"
            onClick={handleCancelFix}
            className="h-6 w-6 rounded-full p-0 hover:bg-[#e6e6e6]"
          >
            <XMarkIcon className="h-4 w-4 text-[#86868b]" />
          </Button>
        </div>

        {!fixedCode ? (
          <div className="space-y-3">
            <textarea
              placeholder="请描述您遇到的问题或需要改进的地方..."
              rows={3}
              className="w-full resize-none rounded-lg border border-[#d2d2d7] bg-white p-2 text-xs text-[#1d1d1f] focus:border-[#0071e3] focus:ring-0 focus:outline-none sm:p-3 sm:text-sm"
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
            />
            <div>{codeFixCompletion}</div>

            <div className="flex justify-end">
              <Button
                onClick={() => handleFixCode(issueDescription)}
                disabled={isFixingCode || !issueDescription.trim()}
                className="flex items-center space-x-1.5 rounded-lg bg-[#0071e3] px-3 py-1.5 text-xs text-white hover:bg-[#0077ed] disabled:opacity-50 sm:text-sm"
              >
                {isFixingCode ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                    <span>修复中...</span>
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>修复代码</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-[#1d1d1f] sm:text-sm">
              AI已分析问题并提供修复方案。是否应用这些修复？
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCancelFix}
                className="rounded-lg border-[#d2d2d7] px-3 py-1.5 text-xs text-[#86868b] hover:bg-[#f5f5f7] sm:text-sm"
                disabled={isApplyingFix}
              >
                取消
              </Button>
              <Button
                onClick={handleApplyFix}
                disabled={isApplyingFix}
                className="flex items-center space-x-1.5 rounded-lg bg-[#0071e3] px-3 py-1.5 text-xs text-white hover:bg-[#0077ed] sm:text-sm"
              >
                {isApplyingFix ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                    <span>应用中...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>应用修复</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
