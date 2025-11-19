import { ChromaClient } from "chromadb";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
export const CHROMA_COLLECTION = process.env.CHROMA_COLLECTION || "documents_collection";

let _client: ChromaClient | null = null;
export function getChromaClient(): ChromaClient {
    if (!_client) {
        _client = new ChromaClient({ path: CHROMA_URL });
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
