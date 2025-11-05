import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { oAuthSignIn } from "../auth/nextjs/actions";

export default function LoginPage({ oauthError }: { oauthError: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Image
            src="/mini-logo.png"
            alt="App Logo"
            width={120}
            height={60}
            className="mx-auto mb-4"
          />
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to continue to the admin dashboard
          </p>
        </div>

        <div className="mt-10">
          <button
            onClick={async () => await oAuthSignIn("google")}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-md font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            <FcGoogle size={30} />
            Continue with Google
          </button>
        </div>

        {oauthError && (
          <div className="mb-4 flex items-center gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 shrink-0 text-red-500 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z"
              />
            </svg>
            <span>{oauthError}</span>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          By signing in, you agree to our{" "}
          <a
            href="/terms"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
