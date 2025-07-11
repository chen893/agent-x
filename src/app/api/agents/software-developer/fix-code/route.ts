import { SoftwareDeveloper } from "@/server/core/agents/softwareDeveloper";

export async function POST(req: Request) {
  const {
    prompt,
    requirement,
    architectureDoc,
    sourceCode,
    issueDescription,
  }: {
    prompt: string;
    requirement: string;
    architectureDoc: string;
    sourceCode: string;
    issueDescription?: string;
  } = (await req.json()) as {
    prompt: string;
    requirement: string;
    architectureDoc: string;
    sourceCode: string;
    issueDescription?: string;
  };

  const body = {
    requirement,
    architectureDoc: architectureDoc || "",
    sourceCode,
    issueDescription,
  };

  console.log("prompt", prompt);
  console.log("body", body);

  const agent = new SoftwareDeveloper("h5开发工程师");
  const result = agent.fixCodeStream(body);
  return result.toDataStreamResponse();
}
