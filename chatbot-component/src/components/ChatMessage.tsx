import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-light.css";
import type { ChatMessageProps } from "../types/chat";

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4 animate-fadeIn`}
    >
      <div
        className={`max-w-sm md:max-w-md lg:max-w-lg
              px-4 py-3 
              break-words whitespace-pre-wrap overflow-hidden
              ${
                isUser
                  ? "bg-primary-blue text-white"
                  : isSystem
                  ? "bg-red-100 text-red-700 border border-red-400"
                  : "bg-light-blue text-dark-text border border-primary-blue"
              } rounded`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : isSystem ? (
          <p className="text-sm leading-relaxed font-semibold">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-navy prose-headings:font-semibold prose-p:text-dark-text prose-p:leading-relaxed prose-a:text-primary-blue hover:prose-a:text-primary-blue-dark prose-a:underline prose-code:bg-white prose-code:text-primary-blue prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-xs prose-pre:bg-white prose-pre:border prose-pre:border-light-blue prose-pre:overflow-x-auto prose-pre:text-xs prose-ul:list-disc prose-ul:ml-4 prose-ol:list-decimal prose-ol:ml-4 prose-li:text-dark-text">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-blue hover:text-primary-blue-dark underline transition-colors"
                  >
                    {children}
                  </a>
                ),
                code: ({ inline, children }: any) => (
                  <code
                    className={
                      inline
                        ? "bg-light-blue text-primary-blue px-1.5 py-0.5 rounded font-mono text-xs"
                        : ""
                    }
                  >
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-white border border-light-blue overflow-x-auto p-3 my-2 rounded">
                    {children}
                  </pre>
                ),
                h1: ({ children }) => (
                  <h1 className="text-navy font-bold text-lg mt-3 mb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-navy font-bold text-base mt-2.5 mb-1.5">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-navy font-semibold text-sm mt-2 mb-1">
                    {children}
                  </h3>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
