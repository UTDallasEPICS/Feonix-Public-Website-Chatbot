import { FcGoogle } from "react-icons/fc";
import { RiErrorWarningLine } from "react-icons/ri";
import { oAuthSignIn } from "../auth/nextjs/actions";

export default function LoginPage({ oauthError }: { oauthError: string }) {
  const handleGoogleSignIn = async () => {
    await oAuthSignIn("google");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#ecf2fb] to-white  px-6">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div
            className="py-12 px-2 text-center"
            style={{
              background: `linear-gradient(to right, var(--color-primary), var(--color-primary-light))`,
            }}
          >
            <div className="flex justify-center mb-6">
              <div className="bg-white/95 p-2 rounded-xl shadow-lg border border-white/30 backdrop-blur-sm">
                <img
                  src="/logo.png"
                  alt="Catch-A-Ride Logo"
                  className="w-100 h-20 object-contain"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>{" "}
            <p className="mt-3 text-lg text-white/90">
              {" "}
              Sign in to access the file management portal
            </p>
          </div>

          <div className="p-10">
            {oauthError && (
              <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-4">
                <RiErrorWarningLine className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <span className="text-red-700 text-base">{oauthError}</span>{" "}
              </div>
            )}
            <button
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-4 rounded-lg border border-gray-300 bg-white px-6 py-4 text-lg font-medium text-gray-700 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-400 active:scale-[0.98]"
            >
              <FcGoogle size={26} />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
        <div className="mt-10 text-center">
          <p className="text-base text-gray-500">
            Need help logging in? Request access from your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
