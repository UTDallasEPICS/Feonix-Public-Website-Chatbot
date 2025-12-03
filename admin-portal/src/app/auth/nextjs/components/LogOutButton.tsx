"use client";

import { logOut } from "../actions";
import { useState } from "react";
import { CiLogout } from "react-icons/ci";
export function LogOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logOut();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-white to-gray-50 border border-gray-200 text-gray-700 font-semibold hover:border-[#0d63e7]/30 hover:bg-linear-to-r hover:from-[#ecf2fb] hover:to-white hover:text-[#0d63e7] transition-all duration-200 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#0d63e7] rounded-full animate-spin"></div>
          Signing out...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <CiLogout className="w-7 h-7 stroke-1" />
          Sign Out
        </span>
      )}
    </button>
  );
}
