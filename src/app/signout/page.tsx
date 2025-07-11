"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignOut() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl });
  };

  const handleCancel = () => {
    router.push("/");
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
              退出登录
            </h1>
            <p className="text-sm text-[#86868b]">确定要退出您的账户吗？</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-full bg-[#0071e3] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0077ed] focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 focus:outline-none active:bg-[#006edb] disabled:opacity-50"
            >
              {isLoading ? (
                <svg
                  className="mr-2 h-4 w-4 animate-spin text-white"
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
              ) : null}
              <span>确认退出</span>
            </button>

            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-full border border-[#d2d2d7] bg-white px-4 py-2.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              <span>取消</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#d2d2d7] bg-white px-4 py-5 text-center text-xs text-[#86868b] sm:px-6 md:px-8">
        <p>© {new Date().getFullYear()} AI Studio. 保留所有权利。</p>
      </footer>
    </div>
  );
}
