"use client";

import { useState } from "react";
import { useUser } from "../context/UserContext";




interface UploadedFile {
    name: string;
    size?: number;
    type?: string;
    savedTo?: string;
}

interface FailedItem {
    name: string;
    error: string;
}

export default function UploadForm() {
    const { user } = useUser();
    const [files, setFiles] = useState<File[]>([]);
    const [result, setResult] = useState<{ uploaded: UploadedFile[]; failed: FailedItem[] } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setResult(null);
        }
    };

    const handleUpload = async () => {
        const formData = new FormData();
        
        files.forEach(file => formData.append("files", file));
formData.append("userId", user?.userId || "");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                setResult({ uploaded: [], failed: [{ name: "Server", error: errorData.error || "Unknown error" }] });
                return;
            }

            const data = await res.json();
            setResult({ uploaded: data.uploaded || [], failed: data.failed || [] });
        } catch (err) {
            console.error("Network error:", err);
            setResult({ uploaded: [], failed: [{ name: "Network", error: "Could not connect to server" }] });
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Upload Files</h1>

            <div className="bg-white p-4 rounded-2xl shadow mb-4">
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="mb-4 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                />

                {files.length > 0 && (
                    <ul className="mb-4 text-sm text-gray-800 list-disc list-inside">
                        {files.map(file => (
                            <li key={file.name}>{file.name}</li>
                        ))}
                    </ul>
                )}

                <button
                    onClick={handleUpload}
                    disabled={files.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
                >
                    Upload Files
                </button>
            </div>

            {result && (
                <div className="bg-gray-100 p-4 rounded-xl space-y-3">
                    <h2 className="text-lg font-semibold mb-2">Upload Results</h2>

                    {result.uploaded.length > 0 && (
                        <div>
                            <h3 className="text-green-700 font-semibold">Uploaded Successfully:</h3>
                            <ul className="list-disc list-inside text-green-700">
                                {result.uploaded.map(file => (
                                    <li key={file.name}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.failed.length > 0 && (
                        <div>
                            <h3 className="text-red-700 font-semibold">Failed to Upload:</h3>
                            <ul className="list-disc list-inside text-red-700">
                                {result.failed.map(file => (
                                    <li key={file.name}>{file.name} - {file.error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}