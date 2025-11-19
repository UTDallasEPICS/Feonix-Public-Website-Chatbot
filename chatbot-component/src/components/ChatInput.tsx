import { FiSend } from "react-icons/fi";
import { useState } from "react";
import type { ChatInputProps } from "../types/chat";

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 p-4 bg-[color-mix(in_oklch,var(--color-light-blue)_90%,var(--color-navy)_10%)] border-t border-light-blue">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className="
          flex-1 px-3 py-2 text-sm text-dark-text 
          placeholder-[color-mix(in_oklch,var(--color-navy)_40%,transparent)]
          resize-none rounded-sm
          bg-light-blue
          border border-[color-mix(in_oklch,var(--color-navy)_20%,transparent)]
          focus:outline-none 
          focus:ring-2 focus:ring-[color-mix(in_oklch,var(--color-primary-blue)_40%,transparent)]
          disabled:bg-[color-mix(in_oklch,var(--color-light-blue)_70%,white)]
          disabled:text-[color-mix(in_oklch,var(--color-navy)_30%,transparent)]
        "
      />

      <button
        onClick={handleSubmit}
        disabled={disabled || !input.trim()}
        className="
          px-3 py-2 rounded-sm
          bg-primary-blue text-white
          hover:bg-primary-blue-dark
          disabled:bg-[color-mix(in_oklch,var(--color-navy)_25%,transparent)]
          disabled:text-[color-mix(in_oklch,var(--color-light-blue)_65%,white)]
          disabled:cursor-not-allowed
          transition-colors flex items-center justify-center
        "
        aria-label="Send message"
      >
        <FiSend size={18} />
      </button>
    </div>
  );
}
