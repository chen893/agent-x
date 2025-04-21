import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import { ProductManagerAgent } from "@/server/core/agents/productManager";
import { SoftwareArchitect } from "@/server/core/agents/softwareArchitect";
import { SoftwareDeveloper } from "@/server/core/agents/softwareDeveloper";

const history = new Map<string, string[]>();

interface CodePreviewResult {
  html: string;
  css: string;
  javascript: string;
}

let currentId = "123";
export const agentRouter = createTRPCRouter({
  generateRequirementDoc: publicProcedure
    .input(z.object({ requirement: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const agent = new ProductManagerAgent("h5产品经理");
      const result = await agent.performTask(`需求分析：${input.requirement}`);
      console.log("result", result);
      history.set(currentId, [result]);
      return result;
    }),
  createSoftwareArchitect: publicProcedure
    .input(z.object({ document: z.string() }))
    .mutation(async ({ ctx, input }) => {
      currentId = input.document;
      const agent = new SoftwareArchitect("h5软件架构师");
      const result = await agent.performTask(input.document);
      console.log("result", result);
      history.set(currentId, [
        ...(history.get(currentId) ?? []),
        JSON.stringify(result),
      ]);
      return result;
    }),
  createSoftwareDeveloper: publicProcedure
    .input(
      z.object({
        requirement: z.string(),
        architectureDoc: z.string(),
        history: z.record(z.string()),
        targetFile: z.enum(["html", "js"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const agent = new SoftwareDeveloper("h5开发工程师");
      const result = await agent.performTask(input);
      return result;
    }),
  generatePreviewCode: publicProcedure
    .input(
      z.object({
        html: z.string().optional(),
        css: z.string().optional(),
        javascript: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result: CodePreviewResult = {
        html: input.html ?? "",
        css: input.css ?? "",
        javascript: input.javascript ?? "",
      };

      return result;
    }),
});
