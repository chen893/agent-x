"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (provider: string) => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7]">
      <header className="border-b border-[#d2d2d7] bg-[rgba(245,245,247,0.8)] px-4 py-3 backdrop-blur-md sm:px-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="text-lg font-semibold text-[#1d1d1f] sm:text-xl"
          >
            AI Studio
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 md:px-8">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-semibold text-[#1d1d1f]">
              欢迎回来
            </h1>
            <p className="text-sm text-[#86868b]">请选择登录方式继续</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleSignIn("github")}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-[#d2d2d7] bg-white px-4 py-2.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              {isLoading ? (
                <svg
                  className="h-5 w-5 animate-spin text-[#86868b]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>使用 GitHub 登录</span>
            </button>

            {/* 可以添加其他登录方式按钮 */}
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-[#0071e3] hover:underline">
              返回首页
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#d2d2d7] bg-white px-4 py-5 text-center text-xs text-[#86868b] sm:px-6 md:px-8">
        <p>© {new Date().getFullYear()} AI Studio. 保留所有权利。</p>
      </footer>
    </div>
  );
}
