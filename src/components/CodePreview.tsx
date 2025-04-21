import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CodePreviewProps {
  html: string;
  css: string;
  javascript: string;
  height?: string;
  width?: string;
  isEmbedded?: boolean;
  buttonText?: string;
}

/**
 * CodePreview 组件
 *
 * 接收 HTML、CSS 和 JavaScript 代码，
 * 可以直接嵌入页面或通过按钮弹出模态框，在 iframe 中渲染这些内容
 */
export function CodePreview({
  html = "",
  css = "",
  javascript = "",
  height = "80vh",
  width = "90vw",
  isEmbedded = false,
  buttonText = "预览代码",
}: CodePreviewProps) {
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 将 HTML、CSS 和 JavaScript 组合成完整的文档
  const srcDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${css}
            /* 添加基础样式 */
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 16px;
            }
          </style>
        </head>
        <body>
          ${html}
          <script>
            ${javascript}
          </script>
        </body>
      </html>
    `;
  }, [html, css, javascript]);

  // 处理按ESC键关闭弹窗或退出全屏
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else if (isOpen && !isEmbedded) {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, isFullscreen, isEmbedded]);

  // 打开预览时禁止页面滚动（仅对弹窗模式）
  useEffect(() => {
    if (isOpen && !isEmbedded) {
      document.body.style.overflow = "hidden";
    } else if (!isEmbedded) {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, isEmbedded]);

  // 当弹窗打开或嵌入模式刷新时重置加载状态
  useEffect(() => {
    if (isOpen || isEmbedded) {
      setIsLoading(true);
    }
  }, [isOpen, isEmbedded, html, css, javascript]);

  // 刷新预览函数
  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey((prev) => prev + 1);
  };

  // 全屏模式的预览
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        <div className="flex items-center justify-between border-b border-[#e6e6e6] bg-gradient-to-r from-[#f9f9f9] to-[#fcfcfc] px-4 py-3">
          <h3 className="flex items-center text-sm font-medium text-[#1d1d1f] sm:text-base">
            <span className="mr-2 flex h-3 w-3 items-center justify-center rounded-full bg-[#34c759] shadow-sm sm:h-3.5 sm:w-3.5"></span>
            全屏预览
          </h3>
          <Button
            onClick={() => setIsFullscreen(false)}
            className="rounded-xl bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-[#1d1d1f] transition-colors hover:bg-[#e6e6e6] sm:px-4 sm:py-2 sm:text-sm"
          >
            退出全屏
          </Button>
        </div>
        <div className="relative flex-1">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
              <div className="flex flex-col items-center">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-[3px] border-[#0071e3]/20 border-t-[#0071e3]"></div>
                <p className="text-sm text-[#86868b] sm:text-base">加载中...</p>
              </div>
            </div>
          )}
          <iframe
            key={`fullscreen-${refreshKey}`}
            title="代码全屏预览"
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-modals allow-same-origin"
            className="h-full w-full border-none"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    );
  }

  // 嵌入式预览
  if (isEmbedded) {
    return (
      <div className="code-preview-embedded overflow-hidden rounded-xl border border-[#e6e6e6] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e6e6e6] bg-gradient-to-r from-[#f9f9f9] to-[#fcfcfc] px-3 py-2 sm:px-4 sm:py-2.5">
          <h3 className="flex items-center text-xs font-medium text-[#1d1d1f] sm:text-sm">
            <span className="mr-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#34c759] shadow-sm sm:h-3.5 sm:w-3.5"></span>
            实时预览
          </h3>
          <div className="flex space-x-1.5 sm:space-x-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="group flex h-6 w-6 items-center justify-center rounded-lg bg-[#f5f5f7] transition-all hover:bg-[#e6e6e6] sm:h-7 sm:w-7"
              title="全屏预览"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-[#424245] transition-colors group-hover:text-[#1d1d1f] sm:h-3.5 sm:w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                />
              </svg>
            </button>
            <button
              onClick={handleRefresh}
              className="group flex h-6 w-6 items-center justify-center rounded-lg bg-[#f5f5f7] transition-all hover:bg-[#e6e6e6] sm:h-7 sm:w-7"
              title="刷新预览"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-[#424245] transition-colors group-hover:text-[#1d1d1f] sm:h-3.5 sm:w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
              <div className="flex flex-col items-center">
                <div className="mb-2 h-6 w-6 animate-spin rounded-full border-[3px] border-[#0071e3]/20 border-t-[#0071e3]"></div>
                <p className="text-xs text-[#86868b] sm:text-sm">加载中...</p>
              </div>
            </div>
          )}
          <iframe
            key={`embedded-${refreshKey}`}
            title="代码预览"
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-modals"
            className="w-full bg-white"
            style={{ height, border: "none" }}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 预览按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="preview-button focus:ring-opacity-50 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        {buttonText}
      </button>

      {/* 弹窗覆盖层 */}
      <AnimatePresence>
        {isOpen && !isEmbedded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            {/* 弹窗内容 */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="code-preview-modal max-h-[95vh] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800"
              style={{ width }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* 弹窗标题栏 */}
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  代码预览
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    title="全屏预览"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    title="关闭"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* iframe 内容区 */}
              <div className="relative p-4">
                {/* 加载状态指示器 */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-800/80"
                    >
                      <div className="mb-3 flex items-center justify-center">
                        <svg
                          className="h-10 w-10 animate-spin text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        预览内容加载中...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <iframe
                  key={`modal-${refreshKey}`}
                  title="代码预览"
                  srcDoc={srcDoc}
                  sandbox="allow-scripts allow-modals"
                  className="w-full rounded-lg transition-all duration-300"
                  style={{
                    height,
                    border: "1px solid #ddd",
                    backgroundColor: "white",
                  }}
                  onLoad={() => setIsLoading(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
