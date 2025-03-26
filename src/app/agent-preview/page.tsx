"use client";

import { useState } from "react";
import { CodePreview } from "@/components";
import { api } from "@/trpc/react";

export default function AgentPreviewPage() {
  const [requirement, setRequirement] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [javascript, setJavascript] = useState("");

  // 使用tRPC调用
  const generateRequirementDoc = api.agent.generateRequirementDoc.useMutation();
  const createSoftwareArchitect =
    api.agent.createSoftwareArchitect.useMutation();
  const createSoftwareDeveloper =
    api.agent.createSoftwareDeveloper.useMutation();
  const generatePreviewCode = api.agent.generatePreviewCode.useMutation();

  // 处理生成代码逻辑
  const handleGenerateCode = async () => {
    if (!requirement.trim()) {
      alert("请输入需求描述");
      return;
    }

    setIsLoading(true);
    try {
      // 1. 生成需求文档
      const reqDoc = await generateRequirementDoc.mutateAsync({
        requirement: requirement,
      });

      // 2. 创建软件架构
      const architectureDoc = await createSoftwareArchitect.mutateAsync({
        document: reqDoc,
      });

      // 3. 生成HTML代码
      const htmlResult = await createSoftwareDeveloper.mutateAsync({
        requirement,
        architectureDoc: JSON.stringify(architectureDoc),
        history: {},
        targetFile: "html",
      });
      setHtml(htmlResult);

      // 4. 生成CSS代码
      const cssResult = await createSoftwareDeveloper.mutateAsync({
        requirement,
        architectureDoc: JSON.stringify(architectureDoc),
        history: {},
        targetFile: "css",
      });
      setCss(cssResult);

      // 5. 生成JavaScript代码
      const jsResult = await createSoftwareDeveloper.mutateAsync({
        requirement,
        architectureDoc: JSON.stringify(architectureDoc),
        history: {},
        targetFile: "js",
      });
      setJavascript(jsResult);

      // 6. 使用预览API（可选，因为我们已经有了各部分的代码）
      await generatePreviewCode.mutateAsync({
        html: htmlResult,
        css: cssResult,
        javascript: jsResult,
      });
    } catch (error) {
      console.error("生成代码时出错:", error);
      alert("生成代码时出错，请查看控制台获取详细信息");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">智能代码生成与预览</h1>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">需求描述</label>
        <textarea
          className="h-40 w-full rounded border p-2"
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="请描述您想要生成的页面需求，例如：创建一个带有登录表单的响应式页面..."
        />
      </div>

      <div className="mb-6">
        <button
          onClick={handleGenerateCode}
          disabled={isLoading}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "生成中..." : "生成代码"}
        </button>
      </div>

      {(html || css || javascript) && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div>
              <h2 className="mb-2 text-xl font-semibold">HTML</h2>
              <textarea
                className="h-60 w-full rounded border p-2 font-mono text-sm"
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                readOnly={isLoading}
              />
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">CSS</h2>
              <textarea
                className="h-60 w-full rounded border p-2 font-mono text-sm"
                value={css}
                onChange={(e) => setCss(e.target.value)}
                readOnly={isLoading}
              />
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">JavaScript</h2>
              <textarea
                className="h-60 w-full rounded border p-2 font-mono text-sm"
                value={javascript}
                onChange={(e) => setJavascript(e.target.value)}
                readOnly={isLoading}
              />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">预览结果</h2>
            <CodePreview
              html={html}
              css={css}
              javascript={javascript}
              height="500px"
            />
          </div>
        </>
      )}
    </div>
  );
}
