"use client";

import { useEffect, useState } from "react";
import { ChatbotButton } from "./ChatbotButton.tsx";
import { ChatbotPanel } from "./ChatbotPanel.tsx";
import type { Message, ChatbotConfig, ChatbotProps } from "../types/chat.ts";
import {
  createChatSession,
  saveMessage,
  clearChatHistory,
  sendMessage,
} from "../services/chatService.ts";

export function Chatbot({
  apiEndpoint,
  exampleQuestions,
  privacyPolicyUrl,
  logoElement,
  welcomeMessage,
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [_error, setError] = useState<string | null>(null);

  // small helper for the fake streaming typing effect
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const newSessionId = await createChatSession();
        setSessionId(newSessionId);
      } catch (err) {
        console.error("Failed to initialize chat session:", err);
        setError("Failed to start chat session");
      }
    };

    initializeSession();
  }, []);

  // updates the last message in the list (used for streaming)
  function updateLastMessage(content: string) {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const last = updated[updated.length - 1];
      updated[updated.length - 1] = { ...last, content };
      return updated;
    });
  }

  const handleSendMessage = async (messageText: string) => {
    if (!sessionId || !messageText.trim()) return;

    try {
      setError(null);

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      // push user message to UI immediately
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);

      // persist user message
      await saveMessage(sessionId, "user", messageText);

      setIsLoading(true);

      // call your existing backend service (no streaming)
      const response = await sendMessage(apiEndpoint, {
        message: messageText,
        messages: nextMessages,
        sessionId,
      });

      const fullBotText: string = response.message ?? "";

      // add empty bot message as placeholder for "streaming"
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // fake streaming effect: reveal text gradually
      let visibleText = "";
      for (const char of fullBotText) {
        visibleText += char;
        updateLastMessage(visibleText);
        // tweak delay (ms) for speed of “typing”
        await sleep(10);
      }

      // save full bot message to DB once
      await saveMessage(sessionId, "bot", fullBotText);
    } catch (err) {
      console.error("Failed to send message:", err);
      const errorText =
        err instanceof Error ? err.message : "Failed to send message";
      setError(errorText);

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "system",
        content: `Error: ${errorText}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!sessionId) return;

    try {
      await clearChatHistory(sessionId);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error("Failed to clear chat:", err);
      setError("Failed to clear chat");
    }
  };

  const config: ChatbotConfig = {
    sessionId,
    apiEndpoint,
    exampleQuestions,
    privacyPolicyUrl,
    logoElement,
    welcomeMessage,
  };

  return (
    <>
      <ChatbotButton
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        unreadCount={0}
      />
      {isOpen && (
        <ChatbotPanel
          isOpen={isOpen}
          messages={messages}
          isLoading={isLoading}
          config={config}
          onClose={() => setIsOpen(false)}
          onSend={handleSendMessage}
          onClearChat={handleClearChat}
        />
      )}
    </>
  );
}
