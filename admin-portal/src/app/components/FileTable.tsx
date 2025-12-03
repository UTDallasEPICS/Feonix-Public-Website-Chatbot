"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
type User = {
  id: number;
  name: string;
  email: string;
};

type Doc = {
  id: number;
  name: string;
  fileType?: string;
  fileSize?: number;
  createdAt?: string;
  user: User;
};

export default function FileTable() {
  const [files, setFiles] = useState<Doc[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setFilteredFiles(files);
      return;
    }

    const term = debouncedSearch.toLowerCase();
    const filtered = files.filter(
      (file) =>
        file.name.toLowerCase().includes(term) ||
        file.user.name.toLowerCase().includes(term)
    );
    setFilteredFiles(filtered);
  }, [debouncedSearch, files]);

  async function fetchFiles() {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setFiles(data.documents || []);
      setFilteredFiles(data.documents || []);
    } catch (e) {
      console.error("Error fetching documents", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(`Are you sure you want to delete this file?`)) return;
    try {
      const res = await fetch(`/api/upload/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Delete failed");
      }
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setFilteredFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete file");
    }
  }

  const formatFileSize = useCallback((size?: number) => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  const formatFileType = useCallback((mime?: string) => {
    if (!mime) return "-";
    const map: Record<string, string> = {
      pdf: "PDF",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "Word",
      "application/msword": "Word",
      "text/plain": "Text",
    };

    if (mime === "pdf" || mime === "application/pdf") return "PDF";
    if (map[mime]) return map[mime];

    const parts = mime.split("/");
    if (parts.length === 2) return parts[1].toUpperCase();
    return mime;
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#ecf2fb] to-white p-4">
      <div className="flex justify-center items-center py-6 bg-transparent">
        <img src="/logo.png" alt="Catch-A-Ride Logo" className="w-96" />
      </div>

      <div className="flex justify-center">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-6xl">
          <div className="flex flex-col gap-3 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-[#0d63e7]">
              File Manager
            </h2>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search files or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d63e7] focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d63e7]"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#ecf2fb] text-left text-gray-700 uppercase text-xs md:text-sm">
                      <th className="p-3 font-extrabold">File Name</th>
                      <th className="p-3 font-extrabold hidden md:table-cell">
                        Size
                      </th>
                      <th className="p-3 font-extrabold hidden md:table-cell">
                        Type
                      </th>
                      <th className="p-3 font-extrabold hidden lg:table-cell">
                        Uploaded By
                      </th>
                      <th className="p-3 font-extrabold hidden md:table-cell">
                        Date
                      </th>
                      <th className="p-3 font-extrabold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="border-b hover:bg-[#ecf2fb]/50 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[200px] md:max-w-[300px]">
                              {file.name}
                            </span>
                            <div className="flex md:hidden items-center gap-2 mt-1 text-sm text-gray-500">
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {formatFileType(file.fileType)}
                              </span>
                              <span>{formatFileSize(file.fileSize)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          {formatFileSize(file.fileSize)}
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {formatFileType(file.fileType)}
                          </span>
                        </td>
                        <td className="p-3 hidden lg:table-cell">
                          <span className="truncate max-w-[180px] block">
                            {file.user.name}
                          </span>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          {file.createdAt
                            ? new Date(file.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="bg-[#0d63e7] text-white px-4 py-2 rounded text-sm hover:bg-[#173052] transition-colors w-full md:w-auto"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredFiles.length === 0 && (
                      <tr>
                        <td
                          className="p-3 text-center text-gray-500"
                          colSpan={6}
                        >
                          {debouncedSearch.trim()
                            ? "No files match your search"
                            : "No files uploaded yet"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {debouncedSearch.trim() && filteredFiles.length > 0 && (
                <div className="mt-4 text-sm text-gray-500">
                  Showing {filteredFiles.length} of {files.length} files
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
