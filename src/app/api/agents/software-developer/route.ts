import { SoftwareDeveloper } from "@/server/core/agents/softwareDeveloper";

export async function POST(req: Request) {
  const {
    prompt,
    requirement,
    architectureDoc,
    history,
    targetFile,
  }: {
    prompt: string;
    // body: {
    requirement: string;
    architectureDoc: string;
    history: Record<string, string>;
    targetFile: "html" | "js";
    // };
  } = (await req.json()) as {
    prompt: string;
    // body: {
    requirement: string;
    architectureDoc: string;
    history: Record<string, string>;
    targetFile: "html" | "js";
    // };
  };
  const body = {
    requirement,
    architectureDoc,
    history,
    targetFile,
  };
  console.log("prompt", prompt);
  console.log("body", body);
  const agent = new SoftwareDeveloper("h5开发工程师");
  const result = agent.generateCodeStream(body);
  return result.toDataStreamResponse();
}
