import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

// Initialize embeddings model
const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
});

// Create a singleton instance of the vector store
let vectorStore: MemoryVectorStore | null = null;

export async function getVectorStore() {
    if (!vectorStore) {
        vectorStore = await MemoryVectorStore.fromTexts(
            [], // Initial empty texts
            [], // Initial empty metadata
            embeddings
        );
    }
    return vectorStore;
}

export async function addDocuments(texts: string[], metadata: Record<string, any>[]) {
    const store = await getVectorStore();
    const documents = texts.map(
        (text, index) => new Document({ pageContent: text, metadata: metadata[index] })
    );
    await store.addDocuments(documents);
    return store;
}

export async function similaritySearch(
    query: string,
    k: number = 4,
    filter?: Record<string, any>
) {
    const store = await getVectorStore();
    const results = await store.similaritySearch(query, k, filter);
    return results;
}

// Helper function to clear the vector store (useful for testing)
export function clearVectorStore() {
    vectorStore = null;
}