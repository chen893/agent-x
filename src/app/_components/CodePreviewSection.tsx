"use client";
import { EyeIcon } from "@heroicons/react/24/outline";
import { CodePreview } from "@/components/CodePreview";
import { motion } from "framer-motion";

interface CodePreviewSectionProps {
  html: string | null | undefined;
}

export const CodePreviewSection = ({ html }: CodePreviewSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3 rounded-2xl border border-[#e6e6e6] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:mt-6 sm:p-6"
    >
      <div className="mb-3 flex items-center space-x-2 sm:mb-4">
        <EyeIcon className="h-4 w-4 text-[#0071e3] sm:h-5 sm:w-5" />
        <h3 className="text-base font-medium text-[#1d1d1f] sm:text-lg">
          代码预览
        </h3>
      </div>
      <div className="overflow-hidden rounded-xl border border-[#e6e6e6] bg-white">
        <CodePreview
          html={html ?? ""}
          css=""
          javascript=""
          height="350px"
          isEmbedded={true}
        />
      </div>
    </motion.div>
  );
};
