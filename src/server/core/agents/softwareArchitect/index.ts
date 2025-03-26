import { AIAgent } from "@/server/core/agent";
import { z } from "zod";

const codeStructureSchema = z.object({
  html: z.string(),
  css: z.string(),
  js: z.string(),
});
export class SoftwareArchitect extends AIAgent {
  constructor(id: string, name = "软件架构师") {
    super(id, name, "软件架构师");
  }

  /**
   * 执行软件架构师的主要任务
   * @param input 任务输入
   * @returns 任务输出
   */
  async performTask(input: string) {
    // 专注于H5代码结构设计
    const res = await this.designCodeStructure(input);
    // console.log(JSON.stringify(res, null, 2));
    return res;
  }

  /**
   * 设计H5代码结构
   * @param input 代码结构相关的输入
   * @returns 代码结构设计
   */
  private async designCodeStructure(input: string) {
    const prompt = `
      作为软件架构师，请分析以下H5项目需求，并提供关键的技术实现建议：

      === 项目需求 ===
      ${input}

      === 技术栈要求 ===
      ${this.techStack}

      请从架构师角度，针对以下三个核心文件提供专业的技术建议：

      1. index.html
      - 页面结构设计要点
      - 关键组件划分
      - 性能优化建议
      - 可访问性考虑

      2. index.css
      - 样式系统设计
      - 响应式布局策略
      - 主题切换方案
      - 性能优化建议

      3. index.js
      - 游戏逻辑设计
      - 需要完成的游戏功能
      - 模块划分方案
      - 数据流设计
      - 状态管理策略
      - 性能优化建议
      - 罗列所有容易出现bug的地方，并给出解决方案

      请以 JSON 格式输出分析结果：
      {
        "html": "针对index.html的架构建议",
        "css": "针对index.css的架构建议",
        "js": "针对index.js的架构建议"
      }

      注意：请从架构师角度出发，提供具体的技术实现建议，帮助开发团队更好地完成需求。
    `;

    const response = await this.llm.generateObject(prompt, codeStructureSchema);
    return response;
  }
}
