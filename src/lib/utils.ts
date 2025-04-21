import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 使用正则表达式从Markdown文本中提取围栏代码块。
 * @param {string} markdownText - 输入的Markdown字符串。
 * @returns {Array<{language: string, code: string}>} - 包含代码块对象的数组，每个对象有 language 和 code 属性。
 */
export function extractFencedCodeBlocks(markdownText: string) {
  // 正则表达式解释:
  // (?:```|~~~)     - 匹配开始的 ``` 或 ~~~ (非捕获组)
  // \s*             - 匹配围栏后面可能存在的零个或多个空白字符
  // ([a-zA-Z0-9-]*) - 捕获组 1: 匹配并捕获语言标识符 (字母、数字、短横线)，可以为空
  // \n              - 匹配换行符
  // ([\s\S]*?)     - 捕获组 2: 匹配任何字符 (包括换行符)，非贪婪模式，直到下一个围栏
  // \n              - 匹配代码块结束前的换行符
  // (?:```|~~~)     - 匹配结束的 ``` 或 ~~~ (非捕获组)
  // (?=\n|$)       - 正向先行断言：确保结束围栏后面是换行符或字符串结尾
  const regex =
    /(?:```|~~~)\s*([a-zA-Z0-9-]*)\n([\s\S]*?)\n(?:```|~~~)(?=\n|$)/g;

  const blocks = [];
  let match;

  // 使用 exec 循环查找所有匹配项
  while ((match = regex.exec(markdownText)) !== null) {
    blocks.push({
      // language 可能为空字符串，表示没有指定语言
      language: match?.[1]?.trim() ?? "plaintext", // 如果没有语言，默认为 plaintext
      // code 内容需要 trim() 来去除可能捕获到的额外空白
      code: match?.[2]?.trim(),
    });
  }

  return blocks;
}

/**
 * 检查并修复可能被截断的HTML代码块
 * @param {string} markdownText - 输入的Markdown字符串
 * @returns {{content: string, blocks: Array<{language: string, code: string}>}} - 修复后的内容和提取的代码块
 */
export function fixTruncatedHtmlBlock(markdownText: string) {
  // 检查是否有HTML代码块开始但没有结束
  const htmlBlockStartRegex = /```html\s*\n/g;
  const htmlBlockEndRegex = /\n\s*```(?=\n|$)/g;

  const startMatches = [...markdownText.matchAll(htmlBlockStartRegex)];
  const endMatches = [...markdownText.matchAll(htmlBlockEndRegex)];

  let fixedContent = markdownText;

  // 如果HTML代码块的开始数量大于结束数量，说明有截断
  if (startMatches.length > endMatches.length) {
    // 添加结束的```
    fixedContent = markdownText + "\n```";
  }

  // 提取修复后的代码块
  const blocks = extractFencedCodeBlocks(fixedContent);

  return {
    content: fixedContent,
    blocks,
    html: blocks?.[0]?.code ?? "",
  };
}

// 正则表达式 (与之前相同，必须包含 'g' 标志)
// g: 全局模式 - 查找所有匹配项
// m: 多行模式 - ^/$ 匹配行首/行尾
// s: 点号全匹配模式 - . 匹配换行符
const htmlBlockRegex = /^\s*```html\s*$\n(.*?)\n^\s*```\s*$/gms;

/**
 * 检查 Markdown 字符串是否恰好包含一个格式正确的 HTML 代码块。
 * @param {string} markdownString 要检查的 Markdown 文本。
 * @returns {boolean} 如果恰好包含一个，则返回 true，否则返回 false。
 */
export function containsExactlyOneHtmlBlock(markdownString: string) {
  // 使用 matchAll 查找所有匹配项
  const matchesIterator = markdownString.matchAll(htmlBlockRegex);

  // 将迭代器转换为数组，以便获取匹配项的数量
  // 方法一：Array.from()
  // const allMatches = Array.from(matchesIterator);
  // 方法二：展开语法 (...)
  const allMatches = [...matchesIterator];

  // 检查找到的匹配项数量是否正好为 1
  return allMatches.length === 1;
}

// 携带源代码，续写
export function continuePrompt(prompt: string, sourceCode: string) {
  // 使用sourceCode末尾的五行的代码开始续写
  const lastFiveLines = sourceCode.split("\n").slice(-5).join("\n");
  return `
  请根据以下需求文档，续写代码：
  ${prompt}

  已生成的代码：
  ${sourceCode}

  要求：
  续写代码，返回内容包裹在 \`\`\`html 和 \`\`\` 之间，内容中先注释说明省略了前面的代码，接着从已经生成的代码最后五行的代码开始续写。

  \`\`\`html
  /* 省略了前面的代码 */
  ${lastFiveLines}
  /* 续写代码 */
  \`\`\`
  `;
}
