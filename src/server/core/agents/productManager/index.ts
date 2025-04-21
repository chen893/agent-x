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
  performTaskStream(input: string): ReturnType<typeof streamText> {
    return this.createPRD(input);
  }
  performTask(input: string): Promise<string> {
    // return this.createPRD(input);
    return this.queryLLM(input);
  }

  /**
   * 需求分析
   * @param input 需求相关的输入
   * @returns 需求分析结果
   */
  private async analyzeRequirements(input: string): Promise<string> {
    const prompt = `
      作为产品经理，请分析以下需求：
      
      ${input}
      
      限制使用的技术栈：
      ${this.techStack}

      1. 产品概述
      2. 目标用户
      3. 用户痛点及解决方案
      4. 核心功能详细说明
      5. 用户流程图
      6. 界面原型描述
      请提供详细的需求分析，包括：
      1. 核心问题和目标
      2. 解决方案概述
      3. 潜在风险
    `;

    return this.queryLLM(prompt);
  }

  /**
   * 创建用户故事
   * @param input 与用户故事相关的输入
   * @returns 用户故事列表
   */
  private async createUserStories(input: string): Promise<string> {
    const prompt = `
      作为产品经理，请根据以下信息创建用户故事：
      
      ${input}
      
      请按照以下格式提供至少5个用户故事：
      1. 作为[用户角色]，我希望能够[功能]，以便[价值/目的]
      2. ...
    `;

    return this.queryLLM(prompt);
  }

  /**
   * 创建产品路线图
   * @param input 与产品规划相关的输入
   * @returns 产品路线图
   */
  private async createProductRoadmap(input: string): Promise<string> {
    const prompt = `
      作为产品经理，请根据以下信息创建产品路线图：
      
      ${input}
      
      请提供分阶段的产品路线图，包括：
      1. 短期目标（1-3个月）
      2. 中期目标（3-6个月）
      3. 长期目标（6-12个月）
      4. 每个阶段的关键功能和里程碑
    `;

    return this.queryLLM(prompt);
  }

  /**
   * 功能优先级排序
   * @param input 与功能相关的输入
   * @returns 优先级排序结果
   */
  private async prioritizeFeatures(input: string): Promise<string> {
    const prompt = `
      作为产品经理，请对以下功能进行优先级排序：
      
      ${input}
      
      请使用RICE评分法（Reach影响范围、Impact影响程度、Confidence信心度、Effort工作量）
      对每个功能进行评分，并提供最终的优先级排序和理由。
    `;

    return this.queryLLM(prompt);
  }

  /**
   * 创建产品需求文档(PRD)
   * @param productName 产品名称
   * @param description 产品描述
   * @returns PRD文档内容
   */
  // productName: string,
  createPRD(description: string): ReturnType<typeof streamText> {
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

    console.log("description", description);
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
“作为 [用户角色]，我想要 [做什么]，以便 [获得什么价值]”
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

🛠 技术栈（如有）：
${this.techStack}

请基于用户需求，输出一份简洁优雅的PRD！ 
（仅输出PRD，无需额外解释，不要输出任何解释）


`;

    // return this.queryLLM(prompt);
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
