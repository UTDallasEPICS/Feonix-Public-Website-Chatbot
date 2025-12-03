import Link from "next/link";
import { FaUpload, FaUsers, FaFile } from "react-icons/fa";
import { AiOutlineRight } from "react-icons/ai";
export default function HomePage() {
  const quickLinks = [
    {
      href: "/upload",
      label: "File Upload",
      icon: <FaUpload />,
      description: "Upload and manage files",
    },
    {
      href: "/file-manager",
      label: "File Manager",
      icon: <FaFile />,
      description: "Browse and organize files",
    },
    {
      href: "/allowed-users",
      label: "User Management",
      icon: <FaUsers />,
      description: "Manage user access",
    },
  ];

  return (
    <main className="min-h-screen bg-linear-to-b from-[#ecf2fb] to-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-full max-w-5xl aspect-5/1 object-contain"
          />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-dark">Admin Portal</h1>
          <p className="text-gray-600">File management dashboard</p>
        </div>

        <div className="space-y-3 mt-8">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center space-x-4 p-4 border border-gray-300 hover:border-primary hover:shadow-sm transition-all duration-150"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <span className="text-primary text-lg">{link.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-dark">{link.label}</h3>
                <p className="text-sm text-gray-500">{link.description}</p>
              </div>
              <AiOutlineRight className="w-4 h-4 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
