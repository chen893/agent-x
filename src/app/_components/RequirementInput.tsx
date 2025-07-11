"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentTextIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

interface RequirementInputProps {
  requirement: string;
  isDocumentLoading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGenerateDocument: (requirement: string) => void;
}

export const RequirementInput = ({
  requirement,
  isDocumentLoading,
  handleChange,
  handleGenerateDocument,
}: RequirementInputProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center space-x-2">
        <DocumentTextIcon className="h-4 w-4 text-[#0071e3] sm:h-5 sm:w-5" />
        <label
          htmlFor="requirement"
          className="text-sm font-medium text-[#1d1d1f] sm:text-base"
        >
          项目需求
        </label>
      </div>
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
        <Input
          id="requirement"
          type="text"
          value={requirement}
          onChange={handleChange}
          placeholder="例如：开发一个在线订餐系统"
          className="h-10 flex-1 rounded-xl border border-[#d2d2d7] bg-[#fafafa] px-4 text-sm text-[#1d1d1f] transition-all duration-200 focus:border-[#0071e3] focus:bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none sm:h-12 sm:text-base"
        />
        <Button
          className="h-10 shrink-0 rounded-xl bg-[#0071e3] px-4 text-sm text-white transition-colors hover:bg-[#0077ed] active:bg-[#006edb] disabled:opacity-50 sm:h-12 sm:px-6 sm:text-base"
          onClick={() => handleGenerateDocument(requirement)}
          disabled={isDocumentLoading || !requirement.trim()}
        >
          {isDocumentLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin sm:mr-2 sm:h-4 sm:w-4" />
              生成中...
            </span>
          ) : (
            <span className="flex items-center">
              <ArrowPathIcon className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
              生成需求文档
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
