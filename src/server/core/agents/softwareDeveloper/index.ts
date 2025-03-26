import { AIAgent } from "@/server/core/agent";

export class SoftwareDeveloper extends AIAgent {
  constructor(name: string) {
    super(name, "软件开发工程师", "软件开发工程师");
  }

  async performTask(input: {
    requirement: string;
    architectureDoc: string;
    history: Record<string, string>;
    targetFile: "html" | "css" | "js";
  }) {
    return this.generateCode(input);
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
    targetFile: "html" | "css" | "js";
  }) {
    const fileDescriptions = {
      html: "HTML结构",
      css: "CSS样式",
      js: "JavaScript逻辑",
    };
    const fileFirstLine = {
      html: "<!-- 当前文件为index.html，还需通过标签引入index.css和index.js -->",
      css: "/*index.css*/",
      js: "/*index.js*/",
    };
    const lastFileLine = {
      html: "<!-- end of index.html -->",
      css: "/* end of index.css */",
      js: "/* end of index.js */",
    };

    const prompt = `
      作为软件开发工程师，请根据以下需求文档和软件架构文档生成${fileDescriptions[targetFile]}的具体代码实现：
      
      技术栈要求:
      ${this.techStack}
     
      需求文档：
      ${requirement}
      
      架构文档：
      ${architectureDoc}
      
      已生成的文件：
      ${Object.entries(history)
        .filter(([key]) => key !== targetFile)
        .map(([key, value]) => `${key.toUpperCase()}文件：\n${value}`)
        .join("\n\n")}
      
      要求：
      1. 代码要符合现代Web开发最佳实践
      2. 确保代码的可维护性和可读性
      3. 添加必要的注释说明
      4. 确保与已生成的文件正确关联
      5. 只生成${fileDescriptions[targetFile]}的代码
      
      请直接返回代码，不要包含任何其他内容或格式说明，不要返回markdown格式，返回内容从${fileFirstLine[targetFile]}开始，返回内容从${lastFileLine[targetFile]}结束，第一行和最后一行是注释。
    `;
    console.log("prompt", prompt);

    const response = await this.llm.generate(prompt);
    if (response.includes(lastFileLine[targetFile])) {
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

          // 构建续写提示词，让模型继续生成代码，包含最后五行作为上下文
          const continuePrompt = `

      需求文档：
      ${requirement}
      
      架构文档：
      ${architectureDoc}
      
      已生成的文件：
      ${Object.entries(history)
        .filter(([key]) => key !== targetFile)
        .map(([key, value]) => `${key.toUpperCase()}文件：\n${value}`)
        .join("\n\n")}

          ${targetFile}文件未完成，请继续编写之前未完成的${fileDescriptions[targetFile]}代码。以下是已经生成的部分的最后五行：
          ${lastFiveLines}
            
            请继续编写代码，在续写内容的开头首先重复这五行，然后继续生成剩余的代码，直接返回代码，不要包含任何其他内容或格式说明，不要返回markdown格式。
            确保代码完整且可用，最后以"${lastFileLine[targetFile]}"结束。
            确保语法正确和逻辑连贯。
            返回内容从${
              lastFiveLines
            }开始，返回内容从${lastFileLine[targetFile]}结束
          `;
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
          if (!processedResponse.includes(lastFileLine[targetFile])) {
            processedResponse += "\n" + lastFileLine[targetFile];
          }
          processedResponse = processedResponse.replace(/```javascript/g, "");

          processedResponse = processedResponse.replace(/```/g, "");
          return processedResponse;
        } catch (error) {
          console.error("继续生成代码失败:", error);
          // 如果继续生成失败，添加结束行并返回原始内容
          processedResponse = processedResponse.replace(/```javascript/g, "");
          processedResponse = processedResponse.replace(/```/g, "");
          return processedResponse + "\n" + lastFileLine[targetFile];
        }
      } else {
        // 如果不是语法不完整，只是缺少结束行，直接添加结束行
        processedResponse = processedResponse.replace(/```javascript/g, "");
        processedResponse = processedResponse.replace(/```/g, "");
        return processedResponse + "\n" + lastFileLine[targetFile];
      }
    }
  }
}
