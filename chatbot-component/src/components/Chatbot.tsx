"use client";

import React, { useState, useEffect, useRef } from 'react';

// Main App component that contains all the chatbot logic and UI.
// This component is the front-end and is designed to run within a Next.js
// application alongside the API route.
export default function App() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  /**
   * Handles sending a message and getting a reply from the API.
   * It sends a POST request to the /api/chatbot endpoint with the user's message.
   */
  const sendMessage = async () => {
    // Prevent sending empty messages or multiple messages while loading.
    if (!message.trim() || isLoading) return;

    // Add user message to the chat log and clear the input field.
    const userMessage = message.trim();
    setChatLog((prev) => [...prev, { sender: 'You', text: userMessage, type: 'user' }]);
    setMessage('');
    setIsLoading(true);

    try {
      // Corrected fetch URL to use the absolute path.
      // This is necessary because the frontend is on a different origin
      // (e.g., a different port) than the backend server.
      const res = await fetch('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await res.json();
      
      // Add the bot's reply to the chat log.
      setChatLog((prev) => [...prev, { sender: 'Bot', text: data.reply, type: 'bot' }]);
    } catch (err) {
      console.error('Error fetching bot reply:', err);
      setChatLog((prev) => [...prev, { sender: 'Bot', text: 'Error replying! Please try again.', type: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Scrolls the chat log to the bottom whenever a new message is added.
   * This provides a smooth, real-time feel to the chat window.
   */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4 font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Chatbot Header */}
        <div className="bg-emerald-600 text-white p-6 shadow-md rounded-t-3xl">
          <h1 className="text-3xl font-bold text-center">Simple Chatbot</h1>
          <p className="text-sm text-center mt-2 opacity-90">I'm here to help you. Ask me something!</p>
        </div>

        {/* Chat Log Display Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatLog.map((chat, idx) => (
            <div
              key={idx}
              className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl p-3 shadow-md text-sm ${
                  chat.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <div className="font-semibold">{chat.sender}</div>
                <div>{chat.text}</div>
              </div>
            </div>
          ))}
          {/* Loading indicator while waiting for the bot's reply */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-2xl p-3 shadow-md bg-gray-200 text-gray-800 rounded-bl-none text-sm">
                <div className="font-semibold">Bot</div>
                <div>...</div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input and Send Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
              placeholder="Type your message here..."
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              className="bg-emerald-600 text-white rounded-xl p-3 shadow-md hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
