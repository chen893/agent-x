"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const errorMessages: Record<string, string> = {
  default: "认证过程中发生错误",
  configuration: "服务器配置错误",
  accessdenied: "访问被拒绝",
  verification: "验证链接已过期或已被使用",
  signin: "尝试登录时出错",
  oauthsignin: "尝试使用OAuth登录时出错",
  oauthcallbackerror: "从OAuth提供商返回时出错",
  oauthcreateaccount: "创建OAuth账户时出错",
  emailcreateaccount: "创建邮箱账户时出错",
  callback: "回调处理时出错",
  oauthaccountnotlinked: "您的账户未关联到此登录方式，请使用原始登录方式",
  emailsignin: "验证邮件链接出错",
  credentialssignin: "您的凭据无效",
  sessionrequired: "请先登录访问此页面",
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "default";
  const errorMessage = errorMessages[error] ?? errorMessages.default;

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
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5f7]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-[#1d1d1f]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-[#1d1d1f]">
              认证错误
            </h1>
            <p className="text-sm text-[#86868b]">{errorMessage}</p>
          </div>

          <div className="space-y-3">
            <Link
              href="/signin"
              className="flex w-full items-center justify-center rounded-full bg-[#0071e3] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0077ed] focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 focus:outline-none active:bg-[#006edb]"
            >
              返回登录
            </Link>

            <Link
              href="/"
              className="flex w-full items-center justify-center rounded-full border border-[#d2d2d7] bg-white px-4 py-2.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 focus:outline-none"
            >
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
