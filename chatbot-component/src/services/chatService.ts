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
