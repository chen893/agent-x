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

    const prompt = `
    你是顶级前端工程师，现就职于apple公司，请根据以下需求文档，生成一个html文件，包含所有的代码实现，
    需求文档：
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
    return this.llm.streamText(prompt);
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
    const prompt = `
    请根据以下需求文档，从已经生成的代码开始续写：
    ${requirement}
  
    已生成的代码：
    ${sourceCode}
  
    要求：
    续写代码，返回内容包裹在 \`\`\`html 和 \`\`\` 之间，内容中第一行先注释说明省略了前面的代码，在注释之后接着从已经生成的代码最后五行的代码开始续写。
  
    \`\`\`html
    /* 省略了前面的代码 */
    ${lastFiveLines}
    /* 续写代码 */
    \`\`\`
    `;
    return this.llm.streamText(prompt);
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
