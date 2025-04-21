import { SoftwareDeveloper } from "@/server/core/agents/softwareDeveloper";

export async function POST(req: Request) {
  const {
    prompt,
    requirement,
    architectureDoc,
    sourceCode,
    targetFile,
  }: {
    prompt: string;
    requirement: string;
    architectureDoc: string;
    sourceCode: string;
    targetFile: "html" | "js";
  } = (await req.json()) as {
    prompt: string;
    requirement: string;
    architectureDoc: string;
    sourceCode: string;
    targetFile: "html" | "js";
  };

  const body = {
    requirement,
    architectureDoc,
    sourceCode,
    targetFile,
  };

  console.log("prompt", prompt);
  console.log("body", body);

  const agent = new SoftwareDeveloper("h5开发工程师");
  const result = agent.continueCodeStream(body);
  return result.toDataStreamResponse();
}
