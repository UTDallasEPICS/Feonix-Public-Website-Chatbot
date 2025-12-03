"use client";

import { useState, useCallback } from "react";
import { useUser } from "../context/UserContext";
import {
  FiUpload,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiLoader,
  FiPaperclip,
} from "react-icons/fi";
import {
  BsFileEarmark,
  BsFiletypeDocx,
  BsFiletypeTxt,
  BsFiletypePdf,
  BsFiletypePptx,
} from "react-icons/bs";

interface UploadResult {
  success: boolean;
  passed: Array<{
    file: string;
    status: string;
    chunks?: number;
  }>;
  failed: Array<{
    file: string;
    status: string;
  }>;
}

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith(".pdf")) {
    return <BsFiletypePdf className="w-5 h-5 text-red-500" />;
  }
  if (fileName.endsWith(".docx")) {
    return <BsFiletypeDocx className="w-5 h-5 text-blue-500" />;
  }
  if (fileName.endsWith(".txt")) {
    return <BsFiletypeTxt className="w-5 h-5 text-gray-500" />;
  }
  return <BsFileEarmark className="w-5 h-5 text-gray-400" />;
};

export default function UploadForm() {
  const { user } = useUser();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (
      !ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
    ) {
      return `Only ${ALLOWED_EXTENSIONS.join(", ")} files allowed`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`;
    }

    return null;
  };

  const handleFileChange = (selectedFiles: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(selectedFiles);

    if (files.length + fileArray.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    const validatedFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        validatedFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(". "));
    }

    if (validatedFiles.length > 0) {
      setFiles((prev) => [...prev, ...validatedFiles]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileChange(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const clearAllFiles = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileChange(droppedFiles);
    }
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("userId", user?.id?.toString() || "");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResult(data);

      if (data.passed && data.passed.length > 0) {
        const passedFilenames = new Set(data.passed.map((p: any) => p.file));
        setFiles((prev) =>
          prev.filter((file) => !passedFilenames.has(file.name))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#ecf2fb] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Upload Documents
          </h1>
          <p className="text-gray-600">
            Upload up to 5 PDF, DOCX, or TXT files
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging
                ? "border-primary bg-primary-50"
                : "border-gray-300 hover:border-primary hover:bg-gray-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <FiUpload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-800 mb-1">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Max {MAX_FILES} files • PDF, DOCX, TXT • Max 5MB each
                </p>
              </div>
              <button className="px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">
                Select Files
              </button>
            </div>
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <FiAlertCircle className="w-5 h-5 text-red-500 mr-3 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800 mb-1">Upload Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium text-gray-800">
                    Selected Files ({files.length}/{MAX_FILES})
                  </h3>
                  <p className="text-sm text-gray-500">
                    {files.reduce((acc, file) => acc + file.size, 0) > 0 &&
                      `Total size: ${formatFileSize(
                        files.reduce((acc, file) => acc + file.size, 0)
                      )}`}
                  </p>
                </div>
                <button
                  onClick={clearAllFiles}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-300 flex items-center justify-center">
                        <span className="text-lg">
                          {getFileIcon(file.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <FiX className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className={`w-full py-3 rounded-lg font-medium flex items-center justify-center
                ${
                  files.length === 0 || isUploading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
            >
              {isUploading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin mr-2" />
                  Processing Files...
                </>
              ) : (
                <>
                  <FiUpload className="w-5 h-5 mr-2" />
                  Process {files.length} File{files.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <FiCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Processing Complete
                  </h2>
                  <p className="text-sm text-gray-600">
                    {result.failed.length === 0
                      ? "All files processed successfully"
                      : `${result.passed.length} processed, ${result.failed.length} failed`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {result.passed.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-green-700 mb-3 flex items-center">
                  <FiCheck className="w-4 h-4 mr-2" />
                  Successfully Processed ({result.passed.length})
                </h3>
                <div className="bg-green-50 rounded-lg p-4">
                  {result.passed.map((item, index) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-green-800">
                            {item.file}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-green-600 mr-3">
                              {item.status}
                            </span>
                            {item.chunks && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {item.chunks} chunks
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-2 shrink-0">
                          <FiCheck className="w-5 h-5 text-green-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.failed.length > 0 && (
              <div>
                <h3 className="font-medium text-red-700 mb-3 flex items-center">
                  <FiAlertCircle className="w-4 h-4 mr-2" />
                  Failed to Process ({result.failed.length})
                </h3>
                <div className="bg-red-50 rounded-lg p-4">
                  {result.failed.map((item, index) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-red-800">
                            {item.file}
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            {item.status}
                          </p>
                        </div>
                        <div className="ml-2 shrink-0">
                          <FiX className="w-5 h-5 text-red-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <FiPaperclip className="w-4 h-4 text-blue-500 mt-0.5 mr-2 shrink-0" />
                    <p className="text-sm text-blue-700">
                      Failed files remain in the list above. You can remove them
                      or try uploading again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setResult(null)}
              className="w-full mt-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close Results
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p className="mt-1">Supported: PDF, DOCX, TXT • Max 5MB per file</p>
        </div>
      </div>
    </div>
  );
}
