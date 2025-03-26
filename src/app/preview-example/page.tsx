"use client";

import { useState } from "react";
import { CodePreview } from "@/components";

export default function PreviewExample() {
  const [html, setHtml] = useState(`<div class="container">
  <h1>代码预览示例</h1>
  <p>这是一个通过 iframe srcdoc 属性渲染的内容</p>
  <button id="clickMe">点击我</button>
</div>`);

  const [css, setCss] = useState(`body {
  font-family: Arial, sans-serif;
  padding: 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
  color: #333;
}

button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #45a049;
}`);

  const [javascript, setJavascript] =
    useState(`document.getElementById('clickMe').addEventListener('click', function() {
  alert('按钮被点击了！');
});`);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">代码预览组件示例</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-xl font-semibold">HTML</h2>
          <textarea
            className="h-60 w-full rounded border p-2 font-mono text-sm"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold">CSS</h2>
          <textarea
            className="h-60 w-full rounded border p-2 font-mono text-sm"
            value={css}
            onChange={(e) => setCss(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">JavaScript</h2>
        <textarea
          className="h-40 w-full rounded border p-2 font-mono text-sm"
          value={javascript}
          onChange={(e) => setJavascript(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">预览结果</h2>
        <CodePreview
          html={html}
          css={css}
          javascript={javascript}
          height="400px"
        />
      </div>
    </div>
  );
}
