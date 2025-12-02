"use client";

import React, { useEffect, useState } from "react";

type Doc = {
    id: number;
    name: string;
    fileType?: string;
    fileSize?: number;
    createdAt?: string;
};

export default function FileTable() {
    const [files, setFiles] = useState<Doc[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, []);

    async function fetchFiles() {
        setLoading(true);
        try {
            const res = await fetch("/api/documents");
            if (!res.ok) throw new Error("Failed to load");
            const data = await res.json();
            setFiles(data.documents || []);
        } catch (e) {
            console.error("Error fetching documents", e);
        } finally {
            setLoading(false);
        }
    }

    async function handleView(id: number) {
        // open the download route in a new tab so the browser can render/preview
        window.open(`/api/documents/${id}`, "_blank");
    }

    async function handleDelete(id: number) {
        if (!confirm("Are you sure you want to delete this file?")) return;
        try {
            const res = await fetch(`/api/upload/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Delete failed");
            }
            // remove from state
            setFiles((prev) => prev.filter((f) => f.id !== id));
        } catch (err) {
            console.error("Delete error", err);
            alert("Failed to delete file");
        }
    }

    function prettyType(mime?: string) {
        if (!mime) return "-";
        const map: Record<string, string> = {
            "application/pdf": "PDF",
            "image/png": "PNG",
            "image/jpeg": "JPEG",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word Document",
            "application/msword": "Word Document",
            "text/plain": "Text",
        };
        if (map[mime]) return map[mime];
        // fallback to the subtype after '/'
        const parts = mime.split("/");
        if (parts.length === 2) return parts[1].toUpperCase();
        return mime;
    }

    return (
        <div className="flex justify-center">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
                <h2 className="text-3xl font-semibold text-[#b63aa6] mb-4">File Manager</h2>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                                <th className="p-3">Name</th>
                                <th className="p-3">Size</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => (
                                <tr key={file.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{file.name}</td>
                                    <td className="p-3">{file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : "-"}</td>
                                    <td className="p-3">{prettyType(file.fileType)}</td>
                                    <td className="p-3">{file.createdAt ? new Date(file.createdAt).toLocaleString() : "-"}</td>
                                    <td className="p-3 space-x-2">
                                        <button onClick={() => handleView(file.id)} className="bg-orange-400 text-white px-3 py-1 rounded text-sm hover:opacity-90">
                                            👁 View
                                        </button>
                                        <button onClick={() => handleDelete(file.id)} className="bg-pink-600 text-white px-3 py-1 rounded text-sm hover:opacity-90">
                                            🗑 Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {files.length === 0 && (
                                <tr>
                                    <td className="p-3" colSpan={5}>
                                        No files
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}