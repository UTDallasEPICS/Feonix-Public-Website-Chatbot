import type { Message, ApiRequest, ApiResponse } from "../types/chat";

const sessions: Record<string, Message[]> = {};

function generateId() {
    return Math.random().toString(36).substring(2, 12);
}

export async function createChatSession(): Promise<string> {
    const id = generateId();
    sessions[id] = [];
    return id;
}

export async function saveMessage(sessionId: string, role: "user" | "bot" | "system", content: string): Promise<Message> {
    if (!sessions[sessionId]) {
        throw new Error("Session does not exist");
    }

    const message: Message = {
        id: generateId(),
        role,
        content,
        timestamp: new Date(),
    };

    sessions[sessionId].push(message);
    return message;
}

export async function getChatHistory(sessionId: string): Promise<Message[]> {
    if (!sessions[sessionId]) {
        throw new Error("Session does not exist");
    }

    return [...sessions[sessionId]];
}

export async function clearChatHistory(sessionId: string): Promise<void> {
    if (!sessions[sessionId]) {
        throw new Error("Session does not exist");
    }

    sessions[sessionId] = [];
}


export async function sendMessage(apiEndpoint: string, request: ApiRequest): Promise<ApiResponse> {
    const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
    }

    return (await response.json()) as ApiResponse;
}

export async function sendMessageStream(
  apiEndpoint: string,
  data: {
    message: string;
    history: Message[];
    sessionId: string;
  },
  onToken: (token: string) => void,
  onError: (error: string) => void,
  onComplete: () => void
) {
  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    
    // handles default responses instantly
    if (contentType?.includes("application/json")) {
      const result = await response.json();
      if (result.message) {
        onToken(result.message);
        onComplete();
        return result.message;
      }
      throw new Error("No message in response");
    }

    // handle streaming responses (text/event-stream)
    if (contentType?.includes("text/event-stream")) {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (!reader) {
        throw new Error("No reader available");
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6);
              try {
                const data = JSON.parse(dataStr);
                
                if (data.token) {
                  onToken(data.token);
                  fullResponse += data.token;
                } else if (data.done) {
                  onComplete();
                  return fullResponse;
                } else if (data.error) {
                  throw new Error(data.error);
                } else if (data.message) {
                  onToken(data.message);
                  onComplete();
                  return data.message;
                }
              } catch (e) {
                console.error("Error parsing SSE data:", e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }

    throw new Error("Unsupported response type");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send message";
    onError(errorMessage);
    throw error;
  }
}

