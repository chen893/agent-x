// import Link from "next/link";

// import { LatestPost } from "@/app/_components/post";
// import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
// import { api } from "@/trpc/react";
import { Agent } from "@/app/_components/agent";
export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  // const agent = api.agent.create.useMutation();

  // const session = await auth();

  // if (session?.user) {
  //   void api.post.getLatest.prefetch();
  // }

  return (
    <HydrateClient>
      <div>
        <Agent />
      </div>
    </HydrateClient>
  );
}
