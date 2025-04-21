import { ProductManagerAgent } from "@/server/core/agents/productManager";

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = (await req.json()) as {
    prompt: string;
  };
  const agent = new ProductManagerAgent("h5产品经理");
  const result = agent.performTaskStream(`需求分析：${prompt}`);
  return result.toDataStreamResponse();
}
