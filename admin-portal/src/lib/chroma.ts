import { ChromaClient } from "chromadb";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
export const CHROMA_COLLECTION = process.env.CHROMA_COLLECTION || "documents_collection";

let _client: ChromaClient | null = null;
export function getChromaClient(): ChromaClient {
    if (!_client) {
        const url = new URL(CHROMA_URL);
        const ssl = url.protocol === 'https:';
        const host = url.hostname;
        const port = parseInt(url.port) || (ssl ? 443 : 80);

        _client = new ChromaClient({
            ssl,
            host,
            port,
        });
    }
    return _client;
}

export async function getOrCreateCollection(embeddings: any) {
    const client = getChromaClient();
    return client.getOrCreateCollection({
        name: CHROMA_COLLECTION,
        embeddingFunction: embeddings,
    });
}
