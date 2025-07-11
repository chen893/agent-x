import { createOpenAI } from "@ai-sdk/openai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { streamText } from "ai";
// import { create } from "@ai-sdk/google";
import { type z } from "zod";
import { generateText, generateObject } from "ai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const streamOpenai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

// const openai = createDeepSeek({
//   apiKey: process.env.OPENAI_API_KEY,
//   baseURL: process.env.OPENAI_BASE_URL,
// });

// const openai = createGoogle({
//   apiKey: process.env.OPENAI_API_KEY,
//   baseURL: process.env.OPENAI_BASE_URL,
// });

const baseModel = openai(
  process.env.OPENAI_MODEL ?? "deepseek/deepseek-chat-v3-0324:free",
);
// 支持返回object
const baseModelWithObject = deepseek(
  process.env.DEEPSEEK_MODEL ?? "deepseek/deepseek-chat-v3-0324:free",
);
/**
 * AI 智能体基类
 * 提供所有智能体的基础功能和通用接口
 */
export abstract class AIAgent {
  // 智能体唯一标识符
  protected id: string;

  // 智能体名称
  protected name: string;

  // 智能体角色描述
  protected role: string;

  // 智能体记忆存储（可扩展为长期记忆）
  protected memory: Map<string, string>;

  // 对话历史记录
  protected conversationHistory: Array<{ role: string; content: string }>;

  // 智能体当前状态
  protected status: "idle" | "busy" | "error";

  // 智能体技术栈限制
  protected techStack: string;

  // 大语言模型实例（模拟）
  protected llm: {
    generate: (
      prompt: string,
      options?: {
        temperature?: number;
        maxTokens?: number;
        stopSequences?: string[];
      },
    ) => Promise<string>;
    generateObject: (
      prompt: string,
      schema: z.ZodSchema,
    ) => Promise<Record<string, string>>;
    streamText: (
      prompt: string,
      options?: {
        temperature?: number;
        maxTokens?: number;
        stopSequences?: string[];
      },
    ) => ReturnType<typeof streamText>;
  };

  protected tools: Map<string, (args: unknown) => Promise<unknown>>;

  /**
   * 构造函数
   * @param id 智能体唯一ID
   * @param name 智能体名称
   * @param role 智能体角色描述
   */
  constructor(id: string, name: string, role: string) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.memory = new Map();
    this.conversationHistory = [];
    this.status = "idle";
    // this.techStack = "";
    this.techStack = `
        固定技术栈：html、css、javascript、tailwindcss。
        可选技术栈：vue、canvas。通过cdn方式导入tailwindcss和vue
        <script src='https://cdn.tailwindcss.com'></script>
        <script src='https://unpkg.com/vue@3/dist/vue.global.js'></script>
    `;

    // 初始化模拟的大语言模型接口
    this.llm = {
      generate: async (prompt: string, options = {}) => {
        // 实际应用中这里会调用真实的LLM API
        // 并处理options中的参数
        const startTime = Date.now();
        try {
          console.log("prompt", prompt);
          const response = await generateText({
            model: baseModel,
            prompt,
            // messages: [
            //   {
            //     role: "system",
            //     content: this.role,
            //   },
            // ],
            temperature: options.temperature ?? 0.6,
          });
          const endTime = Date.now();
          console.log(`LLM调用时间: ${endTime - startTime}ms`);
          return response.text;
        } catch (error) {
          this.status = "error";
          console.error("LLM调用失败:", error);
          throw new Error(
            `LLM调用失败: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },

      streamText: (prompt: string, options = {}) => {
        console.log("streamText", prompt);
        // console.log("prompt", prompt, "options", options);
        // this.llm
        //   .generate(prompt, options)
        //   .then((value) => {
        //     console.log("value", value);
        //   })
        //   .catch((error) => {
        //     console.error("LLM调用失败:", error);
        //     throw new Error(
        //       `LLM调用失败: ${error instanceof Error ? error.message : String(error)}`,
        //     );
        //   });
        // console.log("testResult", testResult);
        const result = streamText({
          // stream: true,
          model: baseModel,
          prompt,
          ...options,

          maxTokens: 16000,
          // experimental_continueSteps: true,
        });
        console.log("reault");
        return result;
      },
      generateObject: async (prompt: string, schema: z.ZodSchema) => {
        try {
          console.log("generateObject");
          const result = await generateObject({
            model: baseModelWithObject,
            schema,

            temperature: 1,
            prompt,
          });
          // console.log(JSON.stringify(result.object, null, 2));
          return result.object as Record<string, string>;
        } catch (error) {
          this.status = "error";
          console.error("LLM调用失败:", error);
          throw new Error(
            `LLM调用失败: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
    };

    this.tools = new Map();
  }

  /**
   * 获取智能体基本信息
   * @returns 包含id、name和role的对象
   */
  getInfo(): { id: string; name: string; role: string; status: string } {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      status: this.status,
    };
  }

  /**
   * 存储信息到记忆
   * @param key 记忆键
   * @param value 记忆值
   */
  remember(key: string, value: string): void {
    this.memory.set(key, value);
  }

  /**
   * 从记忆中检索信息
   * @param key 记忆键
   * @returns 记忆值或undefined
   */
  recall(key: string): string | null {
    return this.memory.get(key) ?? null;
  }

  /**
   * 添加消息到对话历史
   * @param role 发言角色 (system, user, assistant)
   * @param content 消息内容
   */
  addToConversation(role: string, content: string): void {
    this.conversationHistory.push({ role, content });
    // 如果历史记录过长，可以裁剪最早的消息
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }
  }

  /**
   * 获取对话历史记录
   * @param limit 限制返回的消息数量，默认全部
   * @returns 对话历史记录
   */
  getConversationHistory(
    limit?: number,
  ): Array<{ role: string; content: string }> {
    if (limit && limit > 0) {
      return this.conversationHistory.slice(-limit);
    }
    return [...this.conversationHistory];
  }

  /**
   * 清空对话历史
   */
  clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * 抽象方法 - 执行智能体的主要任务
   * @param input 任务输入
   * @returns 任务输出
   */
  abstract performTask(
    input: string | Record<string, unknown>,
  ): Promise<string | Record<string, unknown>>;

  abstract performTaskStream(
    input: string | Record<string, unknown>,
  ): ReturnType<typeof streamText>;

  /**
   * 与LLM交互的通用方法
   * @param prompt 提示词
   * @param options LLM选项（温度、最大token等）
   * @returns LLM生成的响应
   */
  protected async queryLLM(
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      includeHistory?: boolean;
    },
  ): Promise<string> {
    try {
      this.status = "busy";
      let fullPrompt = prompt;

      // 如果需要包含历史记录
      if (options?.includeHistory && this.conversationHistory.length > 0) {
        const historyText = this.conversationHistory
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n");
        fullPrompt = `历史对话:\n${historyText}\n\n你是一个${this.role}，基于以上对话历史，${prompt}`;
      } else {
        fullPrompt = `你是一个${this.role}，${prompt}`;
      }

      const response = await this.llm.generate(fullPrompt, {
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      });

      this.status = "idle";
      return response;
    } catch (error) {
      this.status = "error";
      throw error;
    }
  }

  /**
   * 智能体自我介绍
   * @returns 自我介绍字符串
   */
  async introduce(): Promise<string> {
    return this.queryLLM(`请用100字以内介绍你自己。`);
  }

  /**
   * 调用工具方法
   * @param toolName 工具名称
   * @param args 工具参数
   * @returns 工具执行结果
   */
  async useTool(toolName: string, args: unknown): Promise<unknown> {
    try {
      this.status = "busy";
      const tool = this.tools.get(toolName);
      if (!tool) throw new Error(`Tool ${toolName} not found`);
      const result = await tool(args);
      this.status = "idle";
      return result;
    } catch (error) {
      this.status = "error";
      console.error(`使用工具${toolName}失败:`, error);
      throw new Error(
        `使用工具${toolName}失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 注册工具
   * @param toolName 工具名称
   * @param toolFn 工具函数
   */
  registerTool(
    toolName: string,
    toolFn: (args: unknown) => Promise<unknown>,
  ): void {
    this.tools.set(toolName, toolFn);
  }

  /**
   * 基于语义相似度检索记忆
   * @param query 查询内容
   * @returns 相关记忆内容数组
   */
  async semanticRecall(query: string): Promise<Array<[string, string]>> {
    // 此处应实现真实的语义搜索，现在仅作为示例
    // 在实际应用中，可以使用嵌入模型计算相似度

    // 模拟实现：简单字符串匹配
    const results: Array<[string, string]> = [];

    for (const [key, value] of this.memory.entries()) {
      if (key.includes(query) || value.includes(query)) {
        results.push([key, value]);
      }
    }

    return results;
  }
}

// 一个agent 软件架构师，规划文件的目录结构
// const softwareArchitect = new AIAgent("softwareArchitect", "软件架构师", "软件架构师");
