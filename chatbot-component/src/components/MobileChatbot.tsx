"use client";
import React, { useState, useRef, useEffect } from "react";

export default function MobileChatbot() {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<
    { sender: string; text: string; type: string; references?: string[] }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

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
          sender: "Mr. Feonix",
          text: data.reply,
          type: "bot",
          references: data.references || [],
        },
      ]);
    } catch (err) {
      console.error("Error fetching bot reply:", err);
      setChatLog((prev) => [
        ...prev,
        {
          sender: "Mr. Feonix",
          text: "Error replying! Please try again.",
          type: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-orange-50 flex flex-col border-t border-orange-700">
      {/* Header */}
      <div className="bg-red-600 text-white p-5 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mr. Feonix</h1>
      </div>

      {/* Chat log */}
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

              {chat.type === "bot" && chat.references?.length > 0 && (
                <div className="mt-1 text-xs text-gray-600">
                  <div className="font-semibold">References:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {chat.references.map((ref, i) => (
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
              <div className="font-semibold">Mr. Feonix</div>
              <div>...</div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-5 bg-orange-100 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 p-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="What do you need help with?"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            className="bg-red-600 text-white rounded-xl px-4 py-2 shadow-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
