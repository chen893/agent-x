import { ProductManagerAgent } from "@/server/core/agents/productManager";

export async function POST(req: Request) {
  const {
    prompt,
    feedback,
    originalPRD,
  }: { prompt: string; feedback?: string; originalPRD?: string } =
    (await req.json()) as {
      prompt: string;
      feedback?: string;
      originalPRD?: string;
    };

  const agent = new ProductManagerAgent("h5产品经理");
  const result = agent.performTaskStream(`${prompt}`, feedback, originalPRD);

  return result.toDataStreamResponse();
}
