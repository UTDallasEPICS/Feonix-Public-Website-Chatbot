"use client";

import { logOut } from "../actions";

export function LogOutButton() {
  return (
    <button
      onClick={async () => await logOut()}
      className="bg-red-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-red-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
    >
      Log Out
    </button>
  );
}
