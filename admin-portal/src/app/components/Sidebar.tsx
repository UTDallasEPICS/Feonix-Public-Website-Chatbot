"use client";
import Link from "next/link";
import { FaFileAlt, FaPlusSquare, FaSearch } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { LogOutButton } from "../auth/nextjs/components/LogOutButton";

export default function Sidebar() {
  const { user } = useUser();

  return (
    <div className="bg-[#2E64DF] text-white h-screen w-64 flex flex-col justify-between py-6">
      <div>
        <h1 className="text-3xl font-extrabold px-6 mb-8 border-b border-[#F5BD43] pb-2 text-white">
          Admin Dashboard
        </h1>

        <ul className="space-y-6 px-6">
          <li>
            <Link
              href="/file-manager"
              className="flex items-center gap-3 text-white hover:text-yellow-300"
            >
              <FaFileAlt /> <span className="ml-2">File Manager</span>
            </Link>
          </li>
          <li>
            <Link
              href="/add-file"
              className="flex items-center gap-3 text-white hover:text-yellow-300"
            >
              <FaPlusSquare /> <span className="ml-2">Add File</span>
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
        <img src="/mini-logo.png" alt="Logo" className="w-32 mx-auto opacity-80" />
      </div>
    </div>
  );
}
