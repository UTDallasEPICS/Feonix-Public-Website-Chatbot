import { FiMessageCircle, FiX } from "react-icons/fi";
import type { ChatbotButtonProps } from "../types/chat";

export function ChatbotButton({
  isOpen,
  onClick,
  unreadCount = 0,
}: ChatbotButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-110
        ${
          isOpen
            ? "bg-red-500 hover:bg-red-600 text-white md:hidden"
            : "bg-primary-blue hover:bg-primary-blue-dark text-white"
        }
      `}
      aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
    >
      {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent-yellow text-dark-text text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
