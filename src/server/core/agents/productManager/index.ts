import { AIAgent } from "../../agent";

import { type streamText } from "ai";
export class ProductManagerAgent extends AIAgent {
  /**
   * 构造函数
   * @param id 智能体唯一ID
   * @param name 智能体名称（默认为"产品经理"
   * @param  techStack 技术栈限制）
   */
  constructor(id: string, name = "产品经理") {
    super(id, name, "产品经理");
  }

  /**
   * 执行产品经理的主要任务
   * @param input 任务输入
   * @returns 任务输出
   */
  performTaskStream(
    input: string,
    feedback = "",
    originalPRD?: string,
  ): ReturnType<typeof streamText> {
    return this.createPRD(input, feedback, originalPRD);
  }
  performTask(input: string): Promise<string> {
    // return this.createPRD(input);
    return this.queryLLM(input);
  }

  /**

  /**
   * 创建产品需求文档(PRD)
   * @param productName 产品名称
   * @param description 产品描述
   * @returns PRD文档内容
   */
  // productName: string,
  // 反馈后重新生成PRD
  createPRD(
    description: string,
    feedback?: string,
    originalPRD?: string,
  ): ReturnType<typeof streamText> {
    //       // 产品名称：${productName}

    // const prompt = `
    //   作为产品经理，请为以下产品创建一份详细的PRD（产品需求文档），mvp阶段：

    //   产品描述：${description}

    //   PRD应包含以下部分：
    //   1. 产品概述
    //   2. 目标用户
    //   3. 用户痛点及解决方案
    //   4. 核心功能详细说明
    //   5. 用户流程图
    //   6. 界面原型描述
    //   7. 非功能性需求（性能、安全等）
    //   8. 成功指标
    // `;

    // 反馈改进专用prompt
    const feedbackPrompt = `
角色定位
你是一位精于优化产品需求的分析师。你的任务是根据用户反馈，对已有PRD进行改进和调整，确保产品设计更好地满足用户需求。

工作流程
1. 仔细分析原始需求和用户反馈
2. 判断反馈对PRD各部分的影响
3. 根据反馈修改原PRD中需要调整的内容
4. 输出一份完整的新PRD

注意重点
✅ 保持PRD结构的完整性
✅ 只修改受用户反馈影响的部分
✅ 确保修改后的PRD更符合用户期望
✅ 保持简洁优雅的设计原则
✅ 确保页面美观，符合高级ui设计师审美

原始需求：
${description}

用户反馈：
${feedback}

原始PRD内容：
${originalPRD}

🛠 技术栈（如有）：
${this.techStack}

请基于以上信息，输出一份优化后的PRD！
（仅输出优化后的完整PRD，无需额外解释）
`;

    // 如果有反馈和原始PRD，使用feedbackPrompt
    if (feedback && originalPRD) {
      console.log("feedbackPrompt", feedbackPrompt);
      return this.llm.streamText(feedbackPrompt);
    }

    // 否则使用原始prompt
    const prompt = `

角色定位
你是一位注重用户体验、追求优雅简洁的产品需求分析师。擅长从用户的一句话需求中，提炼出最核心的痛点，并设计简洁、可用、体验愉悦的解决方案。

核心原则
✅ 简洁优雅：不堆砌功能，也不过度简化，确保方案实用且愉悦
✅ 用户导向：始终围绕用户的核心问题设计解决方案
✅ 结构化思维：逻辑清晰，避免模糊描述
✅ 技术可行：结合给定的技术栈，提供可实现的设计
✅ 确保页面美观，符合高级ui设计师审美

输出格式
你的输出是一份清晰、结构化的轻量级PRD，包含以下部分：

1. 需求背景（Context）
🔹 用1-2句话说明用户的核心问题或场景
（例：用户希望快速记录灵感，但现有工具操作繁琐）

2. 产品目标（Goal）
🔹 一句话定义这个方案要解决的核心问题
（例：让用户能快速记录灵感，并方便后续查找）

3. 核心用户场景（Key User Story）
🔹 描述1-2个最关键的场景，格式：
"作为 [用户角色]，我想要 [做什么]，以便 [获得什么价值]"
（例：作为创作者，我想要快速输入并保存灵感，以便后续整理成完整内容）

4. 功能设计（Features）
🔹 列出2-3个最必要的功能，确保体验流畅
（例：① 极简输入框，支持快速记录；② 自动按时间归档；③ 支持标签分类）

5. 验收标准（Success Metrics）
🔹 定义如何判断这个方案是否成功（可量化或可观测）
（例：用户能在5秒内完成一次灵感记录，并能通过时间线或标签找回）

6. 技术考量（Tech Considerations，可选）
🔹 如果用户提供了技术栈，可简要说明如何利用现有技术实现


📌 用户需求输入：
${description}


${this.techStack ? `🛠 技术栈：${this.techStack}` : ""}

${
  feedback
    ? `
🔍 用户反馈：
${feedback}
`
    : ""
}

请基于用户需求，输出一份简洁优雅的PRD！ 
（仅输出PRD，无需额外解释，不要输出任何解释）
`;

    return this.llm.streamText(prompt);
  }

  /**
   * 用户反馈分析
   * @param feedback 用户反馈内容
   * @returns 分析结果和建议
   */
  async analyzeFeedback(feedback: string): Promise<string> {
    const prompt = `
      作为产品经理，请分析以下用户反馈：
      
      ${feedback}
      
      请提供：
      1. 反馈关键点总结
      2. 优先解决的问题
      3. 具体改进建议
      4. 后续跟进计划
    `;

    return this.queryLLM(prompt);
  }

  /**
   * 竞品分析
   * @param competitors 竞争对手信息
   * @returns 竞品分析报告
   */
  async analyzeCompetitors(competitors: string): Promise<string> {
    const prompt = `
      作为产品经理，请对以下竞争对手进行分析：
      
      ${competitors}
      
      请提供详细的竞品分析报告，包括：
      1. 主要竞争对手优势和劣势
      2. 市场差异化机会
      3. 值得借鉴的功能和策略
      4. 潜在竞争风险
      5. 我们的竞争策略建议
    `;

    return this.queryLLM(prompt);
  }
}
