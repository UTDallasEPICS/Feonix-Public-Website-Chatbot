"use client";

import { useState } from "react";

export default function AdminPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [response, setResponse] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResponse(data);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin File Upload</h1>

      <div className="bg-white p-4 rounded-2xl shadow mb-4">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mb-4 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-5 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
        />
        <button
          onClick={handleUpload}
          disabled={files.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
        >
          Upload Files
        </button>
      </div>

      {response && (
        <div className="bg-gray-100 p-4 rounded-xl">
          <h2 className="text-lg font-semibold mb-2">Upload Result</h2>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}