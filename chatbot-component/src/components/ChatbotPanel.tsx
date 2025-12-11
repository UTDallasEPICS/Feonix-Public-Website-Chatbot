import { useEffect, useRef } from "react";
import { ChatHeader } from "./ChatHeader.tsx";
import { ChatMessage } from "./ChatMessage.tsx";
import { ChatInput } from "./ChatInput.tsx";
import { WelcomeScreen } from "./WelcomeScreen.tsx";
import type { ChatbotPanelProps } from "../types/chat";
import "./ChatbotPanel.css";

export function ChatbotPanel({
  isOpen,
  messages,
  isLoading,
  config,
  onClose,
  onSend,
  onClearChat,
}: ChatbotPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed flex flex-col transition-all duration-300 ease-out z-50 bg-white
            ${
              isOpen
                ? "md:bottom-6 md:right-6 md:w-96 md:h-120 md:rounded-none mobile-open"
                : "mobile-closed"
            }
            md:${isOpen ? "flex" : "hidden"}
            ${isOpen ? "inset-0 md:inset-auto" : "inset-0 md:inset-auto"}
          `}
      >
        <ChatHeader
          onClose={onClose}
          onClearChat={onClearChat}
          logoElement={config.logoElement}
        />

        <div className="flex-1 overflow-y-auto p-4 bg-light-blue custom-scrollbar">
          {!hasMessages ? (
            <WelcomeScreen
              welcomeMessage={config.welcomeMessage}
              exampleQuestions={config.exampleQuestions}
              onQuestionSelect={onSend}
            />
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <ChatInput onSend={onSend} disabled={isLoading} />
      </div>
    </>
  );
}
