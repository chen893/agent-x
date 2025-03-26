"use client";
import { api } from "@/trpc/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as FileSaver from "file-saver";
import JSZip from "jszip";
import {
  ClipboardIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  CubeIcon,
  PlayIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodePreview } from "@/components/CodePreview";
import { motion, AnimatePresence } from "framer-motion";

type FileType = "html" | "css" | "js";

export const Agent = () => {
  const [requirement, setRequirement] = useState("");
  const [document, setDocument] = useState("");
  const [architectureDoc, setArchitectureDoc] = useState<
    Record<string, string>
  >({
    html: "",
    css: "",
    js: "",
  });
  const [codeImplementation, setCodeImplementation] = useState<
    Record<string, string>
  >({
    html: "",
    css: "",
    js: "",
  });
  const [currentFile, setCurrentFile] = useState<FileType>("html");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [currentGeneratingFile, setCurrentGeneratingFile] =
    useState<FileType | null>(null);

  const { mutate, isPending } = api.agent.generateRequirementDoc.useMutation({
    onSuccess: (data) => {
      setDocument(data);
      setActiveStep(2);
    },
  });

  const { mutate: createArchitecture, isPending: isArchitecturePending } =
    api.agent.createSoftwareArchitect.useMutation({
      onSuccess: (data) => {
        console.log("data", data);
        setArchitectureDoc(data);
        setActiveStep(3);
      },
    });

  const { mutate: generateCode, isPending: isCodePending } =
    api.agent.createSoftwareDeveloper.useMutation({
      onSuccess: (data) => {
        setCodeImplementation((prev) => ({
          ...prev,
          [currentFile]: data,
        }));

        // 如果是在顺序生成过程中，通知已完成
        if (isGeneratingAll && resolveGeneratePromise) {
          setCurrentGeneratingFile(null); // 清除当前生成标记
          resolveGeneratePromise();
          resolveGeneratePromise = null;
        }
      },
    });

  // 用于存储当前生成代码的Promise resolve函数
  let resolveGeneratePromise: (() => void) | null = null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequirement(e.target.value);
  };

  const handleGenerateCode = (fileType: FileType) => {
    setCurrentFile(fileType);
    const otherCode: Record<string, string> = {};
    Object.entries(codeImplementation).forEach(([key, value]) => {
      if (key !== fileType) {
        otherCode[key] = value || "";
      } else {
        otherCode[key] = "";
      }
    });
    generateCode({
      requirement: document,
      architectureDoc: JSON.stringify(architectureDoc),
      history: otherCode,
      targetFile: fileType,
    });
  };

  const handleCopyText = (text: string, id: string) => {
    try {
      void navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedText(id);
          setTimeout(() => setCopiedText(null), 2000);
        })
        .catch((error) => {
          console.error("复制失败:", error);
        });
    } catch (error) {
      console.error("复制操作异常:", error);
    }
  };

  const handleDownload = async () => {
    try {
      const zip = new JSZip();

      // 添加文件到zip
      Object.entries(codeImplementation).forEach(([key, value]) => {
        const extension =
          key === "html" ? ".html" : key === "css" ? ".css" : ".js";
        zip.file(`index${extension}`, value);
      });

      // 生成zip文件并下载
      const content = await zip.generateAsync({ type: "blob" });

      // 使用 FileSaver 保存文件
      FileSaver.saveAs(content, "project-files.zip");
    } catch (error) {
      console.error("下载文件失败:", error);
    }
  };

  // 顺序生成单个文件类型的代码
  const generateCodeAsync = (fileType: FileType): Promise<void> => {
    return new Promise((resolve) => {
      setCurrentFile(fileType);
      setCurrentGeneratingFile(fileType);
      resolveGeneratePromise = resolve;

      const otherCode: Record<string, string> = {};
      Object.entries(codeImplementation).forEach(([key, value]) => {
        if (key !== fileType) {
          otherCode[key] = value || "";
        } else {
          otherCode[key] = "";
        }
      });

      generateCode({
        requirement: document,
        architectureDoc: JSON.stringify(architectureDoc),
        history: otherCode,
        targetFile: fileType,
      });
    });
  };

  const handleGenerateAllCode = async () => {
    setIsGeneratingAll(true);
    try {
      // 按顺序生成HTML、CSS、JS
      await generateCodeAsync("html");
      await generateCodeAsync("css");
      await generateCodeAsync("js");
    } catch (error) {
      console.error("生成代码失败:", error);
    } finally {
      setIsGeneratingAll(false);
    }
  };

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
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-4 sm:space-y-8 sm:p-6 md:p-8">
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
            <div
              className={`h-0.5 flex-1 transition-colors duration-300 ${activeStep >= 3 ? "bg-[#0071e3]" : "bg-[#e6e6e6]"}`}
            ></div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{
                scale: activeStep >= 3 ? 1 : 0.9,
                opacity: activeStep >= 3 ? 1 : 0.8,
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium sm:h-9 sm:w-9 ${activeStep >= 3 ? "bg-[#0071e3] text-white" : "bg-[#f5f5f7] text-[#86868b]"}`}
            >
              3
            </motion.div>
          </div>

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
                onClick={() => mutate({ requirement: requirement })}
                disabled={isPending || !requirement.trim()}
              >
                {isPending ? (
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

          <AnimatePresence>
            {document && (
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
                  <div className="prose prose-blue max-h-64 overflow-y-auto rounded-xl border border-[#e6e6e6] bg-[#fafafa] p-3 text-sm text-[#1d1d1f] sm:max-h-80 sm:p-5 sm:text-base">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {document}
                    </ReactMarkdown>
                  </div>
                  <motion.button
                    onClick={() => handleCopyText(document, "document")}
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
                </div>
                <Button
                  className="mt-3 w-full rounded-xl bg-[#0071e3] py-2 text-sm transition-all duration-200 hover:bg-[#0077ed] active:bg-[#006edb] disabled:opacity-50 sm:mt-4 sm:py-2.5 sm:text-base"
                  onClick={() => createArchitecture({ document })}
                  disabled={isArchitecturePending}
                >
                  {isArchitecturePending ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin sm:mr-2 sm:h-4 sm:w-4" />
                      生成架构中...
                    </span>
                  ) : !architectureDoc.html ? (
                    <span className="flex items-center justify-center">
                      <CubeIcon className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                      生成软件架构
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <ArrowPathIcon className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                      重新生成软件架构
                    </span>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {architectureDoc.html && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-[#e6e6e6] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:p-6"
              >
                <div className="mb-3 flex items-center space-x-2 sm:mb-4">
                  <CubeIcon className="h-4 w-4 text-[#0071e3] sm:h-5 sm:w-5" />
                  <h3 className="text-base font-medium text-[#1d1d1f] sm:text-lg">
                    软件架构
                  </h3>
                </div>

                <Tabs defaultValue="html" className="w-full">
                  <TabsList className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-[#f5f5f7] p-1 sm:mb-4">
                    <TabsTrigger
                      value="html"
                      className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#0071e3] data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.05)] sm:text-sm"
                    >
                      HTML
                    </TabsTrigger>
                    <TabsTrigger
                      value="css"
                      className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#0071e3] data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.05)] sm:text-sm"
                    >
                      CSS
                    </TabsTrigger>
                    <TabsTrigger
                      value="js"
                      className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#0071e3] data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.05)] sm:text-sm"
                    >
                      JavaScript
                    </TabsTrigger>
                  </TabsList>

                  {Object.entries(architectureDoc).map(([key, value]) => (
                    <TabsContent key={key} value={key} className="mt-0">
                      <div className="relative">
                        <div className="max-h-64 overflow-y-auto rounded-xl border border-[#e6e6e6] bg-[#fafafa] p-3 font-mono text-xs whitespace-pre-wrap text-[#1d1d1f] sm:max-h-80 sm:p-5 sm:text-sm">
                          {value}
                        </div>
                        <motion.button
                          onClick={() => handleCopyText(value, `arch-${key}`)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute top-3 right-3 rounded-full bg-white/90 p-1.5 backdrop-blur transition-colors hover:bg-[#f5f5f7] sm:p-2"
                          title="复制代码"
                        >
                          {copiedText === `arch-${key}` ? (
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

                <div className="mt-4 grid grid-cols-1 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3">
                  {(["html", "css", "js"] as FileType[]).map((fileType) => (
                    <motion.div
                      key={fileType}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 1 }}
                      className="w-full"
                    >
                      <Button
                        className={`w-full rounded-xl py-2 text-sm transition-all duration-200 sm:py-2.5 sm:text-base ${
                          currentFile === fileType && isCodePending
                            ? "bg-[#e8f0fd] text-[#0071e3]"
                            : currentFile === fileType
                              ? "bg-[#0071e3] text-white hover:bg-[#0077ed]"
                              : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ebebeb]"
                        }`}
                        onClick={() => handleGenerateCode(fileType)}
                        disabled={isCodePending || isGeneratingAll}
                      >
                        {isCodePending && currentFile === fileType ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin sm:mr-2 sm:h-4 sm:w-4" />
                            生成中...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <CodeBracketIcon className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                            生成{fileType.toUpperCase()}
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <Button
                  className="mt-3 w-full rounded-xl bg-[#000000] py-2 text-sm text-white transition-colors hover:bg-[#1d1d1f] active:bg-[#333333] disabled:opacity-50 sm:mt-4 sm:py-2.5 sm:text-base"
                  onClick={handleGenerateAllCode}
                  disabled={isCodePending || isGeneratingAll}
                >
                  {isGeneratingAll ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin sm:mr-2 sm:h-4 sm:w-4" />
                      {currentGeneratingFile
                        ? `正在生成${currentGeneratingFile.toUpperCase()}...`
                        : "生成中..."}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <PlayIcon className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                      按顺序生成所有代码
                    </span>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {codeImplementation.html && (
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
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCodeImplementation({
                        html: "",
                        css: "",
                        js: "",
                      })
                    }
                    className="rounded-lg border-[#e6e6e6] px-2 py-1 text-xs text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] sm:px-3 sm:py-1 sm:text-sm"
                  >
                    清空代码
                  </Button>
                </div>

                <Tabs defaultValue="html" className="w-full">
                  <TabsList className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-[#f5f5f7] p-1 sm:mb-4">
                    <TabsTrigger
                      value="html"
                      className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#0071e3] data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.05)] sm:text-sm"
                    >
                      HTML
                    </TabsTrigger>
                    <TabsTrigger
                      value="css"
                      className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#0071e3] data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.05)] sm:text-sm"
                    >
                      CSS
                    </TabsTrigger>
                    <TabsTrigger
                      value="js"
                      className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#0071e3] data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.05)] sm:text-sm"
                    >
                      JavaScript
                    </TabsTrigger>
                  </TabsList>

                  {Object.entries(codeImplementation).map(([key, value]) => (
                    <TabsContent key={key} value={key} className="mt-0">
                      <div className="relative">
                        <div className="max-h-72 overflow-y-auto rounded-xl border border-[#e6e6e6] bg-[#fafafa] p-3 font-mono text-xs whitespace-pre-wrap text-[#1d1d1f] sm:max-h-96 sm:p-5 sm:text-sm">
                          {value}
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
                  下载所有文件
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {codeImplementation.html &&
              codeImplementation.css &&
              codeImplementation.js && (
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
                      html={codeImplementation.html ?? ""}
                      css={codeImplementation.css ?? ""}
                      javascript={codeImplementation.js ?? ""}
                      height="350px"
                      isEmbedded={true}
                    />
                  </div>
                </motion.div>
              )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* 底部装饰元素 */}
      <div className="pointer-events-none fixed bottom-0 left-0 hidden h-32 w-full bg-gradient-to-t from-[#f5f5f7]/50 to-transparent sm:block"></div>
    </div>
  );
};
