import { AIAgent } from "../../agent";

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
  async performTask(input: string): Promise<string> {
    return this.createPRD(input);

    // 基于输入的类型进行不同的处理
    if (input.includes("需求分析")) {
      return this.analyzeRequirements(input);
    } else if (input.includes("用户故事")) {
      return this.createUserStories(input);
    } else if (input.includes("产品规划")) {
      return this.createProductRoadmap(input);
    } else if (input.includes("功能优先级")) {
      return this.prioritizeFeatures(input);
    } else {
      // 默认处理流程
      return this.queryLLM(`作为产品经理，请回应以下内容：${input}`);
    }
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
  async createPRD(description: string): Promise<string> {
    //       // 产品名称：${productName}

    const prompt = `
      作为产品经理，请为以下产品创建一份详细的PRD（产品需求文档）：
      
      产品描述：${description}
      
      PRD应包含以下部分：
      1. 产品概述
      2. 目标用户
      3. 用户痛点及解决方案
      4. 核心功能详细说明
      5. 用户流程图
      6. 界面原型描述
      7. 非功能性需求（性能、安全等）
      8. 成功指标
    `;

    return this.queryLLM(prompt);
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
