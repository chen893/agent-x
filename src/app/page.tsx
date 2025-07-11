// import Link from "next/link";

// import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/auth";
import Link from "next/link";
import { HydrateClient } from "@/trpc/server";
// import { api } from "@/trpc/react";
import { Agent } from "@/app/_components/agent";
import { Sidebar } from "@/app/_components/Sidebar";
import { MainLayout } from "@/app/_components/MainLayout";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  // const agent = api.agent.create.useMutation();
  console.log("home");
  const session = await auth();

  // if (session?.user) {
  //   void api.post.getLatest.prefetch();
  // }

  return (
    <HydrateClient>
      <div className="min-h-screen bg-[#f5f5f7] px-4 py-8 sm:px-6 md:px-8">
        {/* 苹果风格导航栏 */}
        <header className="fixed top-0 right-0 left-0 z-50 border-b border-[#d2d2d7] bg-[rgba(245,245,247,0.8)] px-4 py-3 backdrop-blur-md sm:px-6 md:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-[#1d1d1f] sm:text-xl">
                AI Studio
              </h2>
            </div>
            <nav className="flex items-center space-x-5">
              {session && (
                <div className="hidden items-center gap-3 sm:flex">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name ?? "用户头像"}
                      className="h-8 w-8 rounded-full border border-[#d2d2d7]"
                    />
                  )}
                  <p className="text-sm font-medium text-[#1d1d1f]">
                    {session.user?.name}
                  </p>
                </div>
              )}
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  session
                    ? "border border-[#d2d2d7] bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                    : "bg-[#0071e3] text-white hover:bg-[#0077ed] active:bg-[#006edb]"
                }`}
              >
                {session ? "退出" : "登录"}
              </Link>
            </nav>
          </div>
        </header>

        {/* 主要内容区域 */}
        <div className="pt-16 sm:pt-20">
          <MainLayout>
            <Agent />
          </MainLayout>
        </div>
      </div>
    </HydrateClient>
  );
}
