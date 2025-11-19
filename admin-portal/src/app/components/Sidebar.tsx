"use client";
import Link from "next/link";
import { FaFileAlt, FaPlusSquare, FaSearch } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { LogOutButton } from "../auth/nextjs/components/LogOutButton";

export default function Sidebar() {
  const { user } = useUser();

  return (
    <div className="bg-[#2f3338] text-orange-400 h-screen w-64 flex flex-col justify-between py-6">
      <div>
        <h1 className="text-3xl font-extrabold px-6 mb-8 border-b border-[#a84aa8] pb-2 text-orange-300">
          Admin Dashboard
        </h1>

        <ul className="space-y-6 px-6">
          <li>
            <Link
              href="/file-manager"
              className="flex items-center gap-3 text-orange-300 hover:text-white"
            >
              <FaFileAlt /> <span className="ml-2">File Manager</span>
            </Link>
          </li>
          <li>
            <Link
              href="/add-file"
              className="flex items-center gap-3 text-orange-300 hover:text-white"
            >
              <FaPlusSquare /> <span className="ml-2">Add File</span>
            </Link>
          </li>
          <li>
            <Link
              href="/file-search"
              className="flex items-center gap-3 text-orange-300 hover:text-white"
            >
              <FaSearch /> <span className="ml-2">File Search</span>
            </Link>
          </li>
        </ul>
      </div>

      <div>
        {user ? (
          <>
            <p>Hello, {user.name}!</p>
            <LogOutButton />
          </>
        ) : (
          <p>
            You are not logged in. Please <a href="/login">log in</a>.
          </p>
        )}
      </div>

      <div className="px-6">
        <img src="/logo.png" alt="Logo" className="w-32 mx-auto opacity-80" />
      </div>
    </div>
  );
}
