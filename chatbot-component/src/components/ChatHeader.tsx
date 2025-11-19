import { FiX } from "react-icons/fi";
import { FiRotateCcw } from "react-icons/fi";
import type { ChatHeaderProps } from "../types/chat";

export function ChatHeader({
  onClose,
  onClearChat,
  logoElement,
  title = "Assistant",
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4 bg-navy text-white border-b border-primary-blue">
      <div className="flex items-center gap-3">
        {logoElement ? (
          logoElement
        ) : (
          <div className="w-6 h-6 bg-primary-blue flex items-center justify-center text-xs font-bold">
            C
          </div>
        )}
        <h1 className="text-base font-semibold">{title}</h1>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClearChat}
          className="p-1.5 hover:bg-primary-blue transition-colors"
          aria-label="Clear chat"
          title="Clear chat"
        >
          <FiRotateCcw size={18} />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-primary-blue transition-colors"
          aria-label="Close chatbot"
          title="Close"
        >
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
}
