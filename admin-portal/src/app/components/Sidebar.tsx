"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FaFileAlt,
  FaPlusSquare,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { CiLogin } from "react-icons/ci";
import { useUser } from "../context/UserContext";
import { LogOutButton } from "../auth/nextjs/components/LogOutButton";

export default function Sidebar() {
  const { user } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [windowHeight, setWindowHeight] = useState("100vh");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const setHeight = () => {
      setWindowHeight(`${window.innerHeight}px`);
    };

    checkMobile();
    setHeight();

    window.addEventListener("resize", checkMobile);
    window.addEventListener("resize", setHeight);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("resize", setHeight);
    };
  }, []);

  const sidebarContent = (
    <div
      className="flex flex-col h-full"
      style={{
        background: `linear-gradient(to bottom, var(--color-primary), var(--color-primary-light))`,
        height: isMobile ? windowHeight : "100vh",
      }}
    >
      <div className="flex flex-col items-center mb-10 pt-6 px-4">
        <Link href="/" className="block">
          <div className="w-56 aspect-w-5 aspect-h-1 mb-4 bg-white rounded-xl p-3 shadow-lg">
            <img
              src="/logo.png"
              alt="Catch-A-Ride Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold text-white text-center leading-tight">
            Admin Dashboard
          </h1>
        </Link>
      </div>

      <nav className="flex-1 px-6">
        <ul className="space-y-4">
          <li>
            <Link
              href="/file-manager"
              className="flex items-center gap-4 p-3 rounded-lg text-white hover:bg-white/20 hover:text-white transition-all duration-200"
              onClick={() => isMobile && setIsOpen(false)}
            >
              <FaFileAlt className="text-lg text-white" />
              <span className="font-medium">File Manager</span>
            </Link>
          </li>
          <li>
            <Link
              href="/add-file"
              className="flex items-center gap-4 p-3 rounded-lg text-white hover:bg-white/20 hover:text-white transition-all duration-200"
              onClick={() => isMobile && setIsOpen(false)}
            >
              <FaPlusSquare className="text-lg text-white" />
              <span className="font-medium">Add File</span>
            </Link>
          </li>
          <li>
            <Link
              href="/allowed-users"
              className="flex items-center gap-4 p-3 rounded-lg text-white hover:bg-white/20 hover:text-white transition-all duration-200"
              onClick={() => isMobile && setIsOpen(false)}
            >
              <FaUser className="text-lg text-white" />
              <span className="font-medium">Allowed Users</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="px-6 pb-8 mt-auto border-t border-white/20 pt-6">
        {user ? (
          <div className="flex flex-col items-center">
            <div className="flex flex-col p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 w-full">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shrink-0"
                  style={{
                    background: `linear-gradient(to right, var(--color-accent), #ffcc33)`,
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white wrap-break-word whitespace-normal">
                    {user.name}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <LogOutButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <p className="text-white mb-3">You are not logged in.</p>
            <Link
              href="/login"
              className="w-full inline-block py-3 px-4 rounded-xl bg-linear-to-r from-white to-gray-50 border border-gray-200 text-gray-700 font-semibold hover:border-[#0d63e7]/30 hover:bg-linear-to-r hover:from-[#ecf2fb] hover:to-white hover:text-[#0d63e7] transition-all duration-200 hover:shadow-sm active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <CiLogin className="w-7 h-7 stroke-1" />
                Log In
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-lg text-dark md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <FaTimes className="text-xl" />
          ) : (
            <FaBars className="text-xl" />
          )}
        </button>
      )}

      <div className="hidden md:flex md:flex-col md:h-screen md:w-64 bg-white shadow-lg">
        {sidebarContent}
      </div>

      {isMobile && isOpen && (
        <>
          <div
            className="fixed inset-0 bg-gray-500/60 z-40 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden"
            style={{ height: windowHeight }}
          >
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
