import { AIAgent } from "@/server/core/agent";
import { z } from "zod";
import { type streamText } from "ai";

const codeStructureSchema = z.object({
  html: z.string(),
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
  performTaskStream(input: string): ReturnType<typeof streamText> {
    return this.llm.streamText(input);
  }

  /**
   * 设计H5代码结构
   * @param input 代码结构相关的输入
   * @returns 代码结构设计
   */
  private async designCodeStructure(input: string) {
    const prompt = `

      === 项目需求 ===
      ${input}

      === 技术栈要求 ===
      ${this.techStack}
你的角色： 你同时扮演一位经验丰富的 Web 软件架构师 和一位注重细节的 高级 UI 设计师。
你的任务： 针对一个 仅使用 HTML、原生 JavaScript 和通过 CDN 引入的 Tailwind CSS 构建的 Web 项目，为其核心文件 index.html 和 index.js 提供详细的技术与设计建议。你的建议需要融合架构的健壮性、可维护性考量与 UI/UX 的优雅性、一致性和易用性，指导开发团队在约束条件下构建出色的产品。
项目需求：${input}
技术栈：${this.techStack}
详细指示:
请基于上方提供的 项目背景 和 技术栈约束，分别针对 index.html 和 index.js 提出融合架构与 UI/UX 设计的建议。请专注于架构层面的决策、UI 设计的实现、决策的理由以及所涉及的优缺点权衡 (trade-offs)。请将所有针对 index.html 的建议整合为一个字符串，所有针对 index.js 的建议整合为另一个字符串。
针对 index.html 的建议应涵盖以下要点 (整合为单一字符串，融合架构师和 UI 设计师视角):
1.  语义化结构、SEO 与内容流:
    *   架构师视角: 推荐的 HTML 语义化结构方案 (如何合理使用 header, nav, main, article, aside, footer 等)。结合语义化，需要考虑的关键 SEO 因素。
    *   UI 设计师视角: 如何通过结构确保清晰的内容层级和阅读流，提升用户理解和体验。语义化对辅助技术的支持如何改善用户体验。
2.  样式策略 (Tailwind CSS via CDN) 与视觉设计实现:
    *   架构师视角: CDN 引入 Tailwind 的最佳实践（放置位置、版本）。讨论直接在 HTML 中写大量 class 的可维护性问题及缓解策略（注释、结构嵌套、JS 动态类）。CDN 版本配置的局限性。
    *   UI 设计师视角:
        *   如何利用 Tailwind 的原子化 class 高效、一致地实现品牌视觉指南（颜色、字体、间距、圆角等）？建立（非正式的）设计规范。
        *   如何使用 Tailwind 的修饰符 (hover:, focus:, active:, dark:) 提供清晰、及时的交互反馈，增强用户操作的感知？
        *   如何在 HTML 结构中通过组合 Tailwind class 来构建视觉一致、可复用的 UI 模式（例如卡片、按钮、表单元素）？
        *   强调使用 Tailwind 的 spacing, typography, color 等工具类建立清晰的视觉层级。
3.  概念性 UI 组件划分与设计一致性:
    *   架构师视角: 如何从概念上划分可复用的 UI 单元？这种划分如何通过 HTML 结构和 Tailwind class 来体现？
    *   UI 设计师视角: 如何确保这些划分出的 UI 单元在视觉风格和交互行为上保持高度一致性，形成统一的用户体验？
4.  交互模式与用户反馈:
    *   UI 设计师视角: 如何设计核心交互元素（按钮、链接、表单输入、模态框等）的默认状态、悬停、聚焦、激活和禁用状态？
    *   架构师/UI 视角: 如何使用 HTML 结构（例如 <button>, <input>, <a>）和 Tailwind class（结合 JS 可能的状态切换）来实现这些交互模式，提供明确的视觉提示和操作反馈。
5.  加载性能优化与感知性能:
    *   架构师视角: 优化关键渲染路径策略。CDN 引入 Tailwind 的性能影响。图片资源优化。
    *   UI 设计师视角: 快速加载对用户满意度和第一印象的重要性（感知性能）。加载状态（如骨架屏、加载指示器）的设计与简单实现考量。
6.  响应式设计与跨设备体验:
    *   架构师视角: 如何利用 Tailwind 的响应式修饰符 (sm:, md:, lg: 等) 实现布局和样式的调整？
    *   UI 设计师视角: 如何确保在不同屏幕尺寸下都提供良好、一致的用户体验？关键断点的设计决策，确保内容可读性、元素可点击性。
7.  可访问性 (A11y) 与包容性设计:
    *   架构师视角: 结合 Tailwind class，如何在 HTML 结构层面确保核心 A11y 原则（ARIA roles, 焦点管理 (focus-visible:), 键盘导航）。
    *   UI 设计师视角: 将 A11y 视为包容性设计的核心。确保足够的颜色对比度（利用 Tailwind 调色板），为交互元素提供清晰的焦点状态，确保所有功能可通过键盘访问。
针对 index.js 的建议应涵盖以下要点 (整合为单一字符串，主要为架构师视角，但需考虑 UI 交互实现):
1.  职责范围界定:
    *   原生 JS 环境下 index.js (或相关 JS 文件) 的核心职责（DOM 操作以响应用户交互、实现 UI 设计师定义的动态效果、简单状态管理、与 API 交互）。如何避免成为“万能脚本”？
2.  代码组织与模块化 (原生 JS):
    *   推荐的原生 JS 组织代码方式（ES6 模块、IIFE、函数、简单对象/类）。文件结构组织。
    *   模块划分建议（例如：UI 交互模块 - 负责实现特定 UI 模式的 JS 逻辑、API 调用模块、状态管理模块、工具函数）。
3.  数据流与 DOM 交互 (实现 UI):
    *   事件驱动的数据流。
    *   使用原生 DOM API 实现 UI 更新（例如，根据状态切换 Tailwind class、更新文本内容、显示/隐藏元素）的最佳实践和性能考量。强调封装 DOM 操作，使其易于维护和与 UI 设计意图对应。
4.  状态管理 (原生 JS - 驱动 UI 变化):
    *   简单有效的状态管理方法（data-* 属性、闭包、简单对象/类）。如何设计状态以准确反映 UI 设计师定义的各种界面状态？如何高效地同步状态变化到 UI（通过更新 class 或内容）。
5.  运行时性能优化 (保障流畅交互):
    *   Debounce/Throttle 用于事件处理，确保交互的流畅性。
    *   高效 DOM 操作。
    *   预防内存泄漏（移除监听器等）。
6.  错误处理与健壮性:
    *   原生 JS 错误处理策略。用户体验角度：如何在出错时给用户适当的反馈？
7.  常见架构风险与规避 (原生 JS + Tailwind):
    *   风险识别（面条式代码、全局污染、DOM 操作混乱、状态与视图不同步、Tailwind class 维护困难、可测试性差）。
    *   规避措施（强制模块化、纯函数、封装 DOM 操作（可命名对应 UI 模式）、清晰命名、注释复杂 Tailwind 组合、考虑简单的测试策略）。
输出格式:
请将你的分析和建议以 JSON 格式输出，结构如下：
{
  "html": "这里是针对 index.html 的所有架构建议和 UI 设计考量，整合成一个详细的字符串...",
  "js": "这里是针对 index.js 的所有架构建议，并考虑了 UI 交互的实现，整合成一个详细的字符串..."
}
    `;

    const response = await this.llm.generateObject(prompt, codeStructureSchema);
    return response;
  }
}
