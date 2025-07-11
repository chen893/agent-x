import { extractFencedCodeBlocks } from "@/lib/utils";
import { AIAgent } from "@/server/core/agent";
import { type streamText } from "ai";

export class SoftwareDeveloper extends AIAgent {
  constructor(name: string) {
    super(name, "软件开发工程师", "软件开发工程师");
  }

  async performTask(input: {
    requirement: string;
    architectureDoc: string;
    history: Record<string, string>;
    targetFile: "html" | "js";
  }) {
    return this.generateCode(input);
  }

  performTaskStream(input: string): ReturnType<typeof streamText> {
    return this.llm.streamText(input);
  }

  generateCodeStream({
    requirement,
    architectureDoc,
    history,
    targetFile,
  }: {
    requirement: string;
    architectureDoc: string;
    history: Record<string, string>;
    targetFile: "html" | "js";
  }): ReturnType<typeof streamText> {
    // return this.llm.streamText(input);
    const fileDescriptions = {
      html: "HTML结构和样式",
      js: "JavaScript逻辑",
    };
    const fileFirstLine = {
      html: "<!-- 当前文件为index.html，还需通过标签引入index.js -->",
      js: "/*index.js*/",
    };
    const lastFileLine = {
      html: "<!-- end of index.html -->",
      js: "/* end of index.js */",
    };

    /**    你是一位精通网页设计（UI/UX）和前端开发（HTML, CSS, JavaScript）的资深前端工程师。你不仅追求代码的功能性，更注重页面的视觉美感、用户体验以及代码质量。
    
    
    关键要求：
    1. 视觉美观 (Aesthetics): 运用良好的设计原则，确保布局合理、色彩搭配协调、字体选择恰当，整体视觉效果专业且吸引人。
    2. 响应式设计 (Responsiveness): 代码必须能够自适应不同屏幕尺寸，在桌面端（PC）和移动端（手机、平板）都能良好显示和正常使用。
    3. 用户体验 (User Experience): 考虑交互的流畅性和直观性。
    4. 代码质量 (Code Quality): 代码应结构清晰、易于维护、遵循前端最佳实践，并考虑性能优化。

    请根据以下需求文档，生成一个html文件，包含所有的代码实现。
    */
    // const prompt = `
    // 你是顶级前端工程师，现就职于apple公司，请根据以下需求文档，生成一个html文件，包含所有的代码实现，
    // 需求文档：
    // ${requirement}
    // `;
    const prompt1 = `
角色设定
你是一位资深前端开发专家,现就职于apple公司，专注于根据产品需求文档(PRD)生成高质量、美观、功能完整的HTML页面。你精通HTML5、CSS3和基础JavaScript，能够创建响应式、无障碍且符合现代Web标准的页面。

需求文档：
${requirement}

输出要求
你必须输出：

完整、可直接运行的HTML代码

确保代码无错误且符合W3C标准

美观的视觉设计

响应式布局(除非特别要求不包含)


工作流程
仔细分析PRD需求

设计合理的页面结构和布局

编写语义化的HTML标记

添加美观且功能完整的CSS样式

实现所需的交互功能

进行多设备测试

输出最终代码
`;

    const initHTML = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <style type="text/tailwindcss">
      @theme {
        --color-clifford: #da373d;
      }
    </style>
  </head>
  <body>
    <div id="app">
      <h1 class="text-3xl font-bold underline text-clifford">{{ message }}</h1>
    </div>

  </body>

  <script>
    const { createApp, ref } = Vue

    createApp({
      setup() {
        const message = ref('Hello vue!')
        return {
          message
        }
      }
    }).mount('#app')
  </script>
</html>
`;

    const prompt = `
你是一位精通 Vue.js 和 Tailwind CSS 的前端开发专家。

你的任务是根据用户的需求，完善下方的 Vue.js 单文件应用程序。请确保最终的输出是一个单一、完整且可直接运行的 HTML 文件。

## 当前代码
\`\`\`html
${initHTML}
\`\`\`

## 需求文档
${requirement}
`;
    // const prompt = `
    //   作为前端开发高级工程师，请根据以下需求文档生成${targetFile}文件，包含${fileDescriptions[targetFile]}具体代码实现：

    //   技术栈要求:
    //   ${this.techStack}

    //   需求文档：
    //   ${requirement}

    //   已生成的文件：
    //   ${Object.entries(history)
    //     .filter(([key]) => key !== targetFile)
    //     .map(([key, value]) => `${key.toUpperCase()}文件：\n${value}`)
    //     .join("\n\n")}

    //   要求：
    //   1. 一共两个文件，index.html和index.js，本次文件只生成${targetFile} 文件
    //   2.请直接返回代码，不要包含任何其他内容或格式说明，不要返回markdown格式，返回内容从${fileFirstLine[targetFile]}开始，返回内容从${lastFileLine[targetFile]}结束，第一行和最后一行是注释。

    // `;
    // console.log("prompt", prompt);
    return this.llm.streamText(prompt, {
      temperature: 0,
    });
  }

  // 续写代码的方法
  continueCodeStream({
    requirement,
    architectureDoc,
    sourceCode,
    targetFile,
  }: {
    requirement: string;
    architectureDoc: string;
    sourceCode: string;
    targetFile: "html" | "js";
  }): ReturnType<typeof streamText> {
    const lastFiveLines = sourceCode?.split("\n").slice(-5).join("\n");
    const prompt = `你是一位专业的 AI 代码助手，专门负责分段完成因过长而无法一次性生成的复杂代码。你非常擅长理解上下文并进行无缝的代码“接力续写”。
请根据以下需求文档，续写已经存在的代码：
${requirement}
  
已存在的代码：
${sourceCode}
  
要求：
续写代码，返回内容包裹在 \`\`\`html 和 \`\`\` 之间，内容中第一行先注释说明省略了前面的代码（/* 省略了前面的代码 */），在注释之后从已存在代码的最后五行开始续写。
  
例子：
\`\`\`html
/* 省略了前面的代码 */
${lastFiveLines}
/* 这里开始续写代码 */
\`\`\``;

    return this.llm.streamText(prompt);
  }

  // 修复代码的方法
  fixCodeStream({
    requirement,
    sourceCode,
    issueDescription,
  }: {
    requirement: string;
    architectureDoc: string;
    sourceCode: string;
    issueDescription?: string;
  }): ReturnType<typeof streamText> {
    /**
     * 
     * 
请使用以下格式提供代码修复方案，通过精确的搜索和替换块来定位和修改代码：

\`\`\`
------- SEARCH
[需要替换的精确代码片段]
=======
[替换后的新代码]
+++++++ REPLACE
\`\`\`

修复规则：
1. SEARCH 部分必须与源代码中的内容完全匹配，包括空格、缩进和换行
2. 每个 SEARCH/REPLACE 块只会替换第一个匹配项
3. 如需多处修改，请在一个diff块中提供多个 SEARCH/REPLACE 块，按照它们在文件中出现的顺序排列
4. 保持搜索和替换块简洁，仅包含需要修改的部分及其必要上下文
5. 每个搜索块必须包含完整的行，不要在行中途截断
6. 对于移动代码：使用两个块（一个删除原位置代码，一个在新位置插入）
7. 对于删除代码：REPLACE 部分留空

请在修复前分析问题根源，考虑功能需求和最佳实践，确保修复后的代码可以正确运行。
     */
    const fixPrompt = `
你是代码修复专家。请分析以下代码中存在的问题，并提供修复方案：

需求文档：
${requirement}


源代码：
${sourceCode}

${issueDescription ? `问题描述：\n${issueDescription}\n` : ""}

- diff：（必填）一个或多个遵循以下确切格式的搜索/替换块：

\`\`\`
------- 搜索
[要查找的精确内容]
=======
[要替换的新内容]
+++++++ 替换
\`\`\`
关键规则：
1. 搜索内容必须与要查找的相关文件部分完全匹配：
    * 逐字符匹配，包括空格、缩进、行尾
    * 包括所有注释、文档字符串等
2. 搜索/替换块将仅替换首次匹配的内容。
    * 如果需要进行多次更改，可包含多个唯一的搜索/替换块。
    * 在每个搜索部分中仅包含足够的行，以唯一匹配每组需要更改的行。
    * 使用多个搜索/替换块时，按它们在文件中出现的顺序列出。
3. 保持搜索/替换块简洁：
    * 将大型搜索/替换块分解为一系列较小的块，每个块更改文件的一小部分。
    * 仅包含更改的行，如有必要，包含一些周围的行以确保唯一性。
    * 不要在搜索/替换块中包含长串不变的行。
    * 每行必须完整。切勿中途截断行，因为这可能导致匹配失败。
4. 特殊操作：
    * 移动代码：使用两个搜索/替换块（一个从原始位置删除 + 一个插入到新位置）
    * 删除代码：使用空的替换部分


请将你的修复方案以 <diff> 和 </diff> 标签包裹：

<diff>
[搜索和替换块]
</diff>

示例：
<diff>
------- SEARCH
import React from 'react';
=======
import React, { useState } from 'react';
+++++++ REPLACE

------- SEARCH
function handleSubmit() {
  saveData();
  setLoading(false);
}

=======
+++++++ REPLACE

------- SEARCH
return (
  <div>
=======
function handleSubmit() {
  saveData();
  setLoading(false);
}

return (
  <div>
+++++++ REPLACE
</diff>
`;

    return this.llm.streamText(fixPrompt);
  }

  private async generateCode({
    requirement,
    architectureDoc,
    history,
    targetFile,
  }: {
    requirement: string;
    architectureDoc: string;
    history: Record<string, string>;
    targetFile: "html" | "js";
  }) {
    const fileDescriptions = {
      html: "HTML结构和样式",
      js: "JavaScript逻辑",
    };
    const fileFirstLine = {
      html: "<!-- 当前文件为index.html，还需通过标签引入index.js -->",
      js: "/*index.js*/",
    };
    const lastFileLine = {
      html: "<!-- end of index.html -->",
      js: "/* end of index.js */",
    };

    const prompt = `
    需求文档：
    ${requirement}，

    
    请根据需求文档，生成一个html文件，包含所有的代码实现，

    `;
    const prompt1 = `
      作为前端开发高级工程师，请根据以下需求文档生成${targetFile}文件，包含${fileDescriptions[targetFile]}具体代码实现：
      
      技术栈要求:
      ${this.techStack}
     
      需求文档：
      ${requirement}
  
      
      已生成的文件：
      ${Object.entries(history)
        .filter(([key]) => key !== targetFile)
        .map(([key, value]) => `${key.toUpperCase()}文件：\n${value}`)
        .join("\n\n")}
      
      要求：
      1. 一共两个文件，index.html和index.js，本次文件只生成${targetFile} 文件
      2.请直接返回代码，不要包含任何其他内容或格式说明，不要返回markdown格式，返回内容从${fileFirstLine[targetFile]}开始，返回内容从${lastFileLine[targetFile]}结束，第一行和最后一行是注释。
    `;
    console.log("prompt", prompt);

    const response = await this.llm.generate(prompt);
    if (response.includes(lastFileLine[targetFile])) {
      // response = response.replace(/```javascript/g, "");
      // response = response.replace(/```/g, "");
      const blocks = extractFencedCodeBlocks(response);
      console.log("blocks", blocks);
      return response;
    } else {
      // 处理响应不包含结束行的情况

      // 确保响应以开始行开头
      let processedResponse = response;
      if (!processedResponse.trim().startsWith(fileFirstLine[targetFile])) {
        processedResponse =
          fileFirstLine[targetFile] + "\n" + processedResponse;
      }

      // 检测生成是否中断（是否包含结束行）
      const isGenerationIncomplete = !processedResponse.includes(
        lastFileLine[targetFile],
      );

      // 如果检测到生成不完整，尝试继续生成
      if (isGenerationIncomplete) {
        try {
          // 获取原始代码的最后五行作为上下文
          const lines = processedResponse.split("\n");
          const lastFiveLines = lines
            .slice(Math.max(0, lines.length - 5))
            .join("\n");

          const endLine = "---end---";
          // 构建续写提示词，让模型继续生成代码，包含最后五行作为上下文
          const continuePrompt = `

      需求文档：
      ${requirement}
      
      
      已生成的文件：
      ${Object.entries(history)
        .filter(([key]) => key !== targetFile)
        .map(([key, value]) => `${key.toUpperCase()}文件：\n${value}`)
        .join("\n\n")}
          

            正在生成的文件，需要补全：
            ${processedResponse}

            请继续编写之前未完成的内容。以下是已经生成的部分的最后五行：
            ${lastFiveLines}
            
            在续写内容的开头首先重复这五行，然后继续生成剩余的部分。
            返回内容从${lastFiveLines}开始，
          `;
          // 要是所有内容结束了，返回${endLine}
          console.log("开始续写", lastFiveLines);

          // 调用模型继续生成
          const continuedResponse = await this.llm.generate(continuePrompt);
          console.log("continuedResponse", continuedResponse);

          // 将继续生成的内容与原始内容合并
          const cleanContinued = continuedResponse || "";

          // 移除原始内容的最后五行
          const originalContent =
            lines.length <= 5
              ? ""
              : lines.slice(0, lines.length - 5).join("\n");

          // 合并内容 - 原始内容(不包含最后五行) + 续写内容(包含重复的五行)
          processedResponse = originalContent;
          // 如果原始内容不为空，添加换行符
          if (originalContent.trim()) {
            processedResponse += "\n";
          }
          processedResponse += cleanContinued.trim();

          // 如果仍然没有结束行，添加结束行
          // if (!processedResponse.includes(lastFileLine[targetFile])) {
          //   processedResponse += "\n" + lastFileLine[targetFile];
          // }
          const blocks = extractFencedCodeBlocks(processedResponse);
          console.log("blocks", blocks);
          // processedResponse = processedResponse.replace(/```javascript/g, "");

          // processedResponse = processedResponse.replace(/```/g, "");
          const html = blocks.filter((block) => block.language === "html");
          const js = blocks.filter((block) => block.language === "javascript");
          // return html[0].code + "\n" + js[0].code;
          if (targetFile === "html") {
            return html?.[0]?.code ?? "";
          } else {
            return js?.[0]?.code ?? "";
          }
        } catch (error) {
          console.error("继续生成代码失败:", error);
          // 如果继续生成失败，添加结束行并返回原始内容
          // processedResponse = processedResponse.replace(/```javascript/g, "");
          // processedResponse = processedResponse.replace(/```/g, "");
          return processedResponse + "\n" + lastFileLine[targetFile];
        }
      } else {
        // 如果不是语法不完整，只是缺少结束行，直接添加结束行
        // processedResponse = processedResponse.replace(/```javascript/g, "");
        // processedResponse = processedResponse.replace(/```/g, "");
        return processedResponse + "\n" + lastFileLine[targetFile];
      }
    }
  }
}
