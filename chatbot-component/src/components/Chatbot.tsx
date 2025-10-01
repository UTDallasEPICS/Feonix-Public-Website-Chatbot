"use client";
import React, { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<
    { sender: string; text: string; type: string; references?: string[] }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Resizable + position state
  const [size, setSize] = useState({ width: 300, height: 400 });
  const isResizing = useRef(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;

      const dx = startX - moveEvent.clientX;
      const dy = startY - moveEvent.clientY;

      const newWidth = Math.max(300, startWidth + dx);
      const newHeight = Math.max(400, startHeight + dy);

      setSize({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setChatLog((prev) => [
      ...prev,
      { sender: "You", text: userMessage, type: "user" },
    ]);
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      setChatLog((prev) => [
        ...prev,
        {
          sender: "Bot",
          text: data.reply,
          type: "bot",
          references: data.references || [],
        },
      ]);
    } catch (err) {
      console.error("Error fetching bot reply:", err);
      setChatLog((prev) => [
        ...prev,
        { sender: "Bot", text: "Error replying! Please try again.", type: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        width: size.width,
        height: size.height,
      }}
      className="fixed bottom-4 right-4 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border border-gray-200"
    >
      {/* Header */}
      <div className="bg-red-600 text-white p-3 shadow-md rounded-t-3xl">
        <h1 className="text-lg font-bold text-center">Chatbot</h1>
      </div>

      {/* Chat Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatLog.map((chat, idx) => (
          <div
            key={idx}
            className={`flex ${
              chat.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-2xl p-2 shadow-md text-sm ${
                chat.type === "user"
                  ? "bg-orange-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              <div className="font-semibold">{chat.sender}</div>
              <div>{chat.text}</div>

              {chat.type === "bot" && chat.references && chat.references?.length > 0 && (
                <div className="mt-1 text-xs text-gray-600">
                  <div className="font-semibold">References:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {chat.references!.map((ref, i) => (
                      <li key={i}>
                        <a
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 underline"
                        >
                          {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl p-2 shadow-md bg-gray-200 text-gray-800 rounded-bl-none text-sm">
              <div className="font-semibold">Bot</div>
              <div>...</div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            className="bg-red-600 text-white rounded-xl px-3 py-2 shadow-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>

      {/* Resize Handle (Top-Left) */}
      <div
        onMouseDown={startResize}
        className="absolute top-2 left-2 w-4 h-4 cursor-nw-resize bg-gray-300 rounded"
      />
    </div>
  );
}
