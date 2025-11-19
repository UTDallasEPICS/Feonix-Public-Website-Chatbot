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

      setMessages((prev) => [...prev, userMessage]);
      await saveMessage(sessionId, "user", messageText);

      setIsLoading(true);

      const response = await sendMessage(apiEndpoint, {
        message: messageText,
        messages: [...messages, userMessage],
        sessionId,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      await saveMessage(sessionId, "bot", response.message);
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
