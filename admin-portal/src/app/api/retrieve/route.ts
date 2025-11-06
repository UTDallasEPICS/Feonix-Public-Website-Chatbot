import { NextResponse } from "next/server";
import { ChromaClient } from "chromadb";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

const client = new ChromaClient();
const COLLECTION_NAME = "text_files_collection";
const TOP_K = 5; 

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'query' string" },
        { status: 400 }
      );
    }

    // --- Generate embedding for the query using Hugging Face ---
    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: "BAAI/bge-m3",
    });

    const queryEmbedding = await embeddings.embedQuery(query);

    // --- Retrieve Chroma collection ---
    const collection = await client.getCollection({ name: COLLECTION_NAME });

    // --- Query Chroma directly to get chunk text, file, and distance ---
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: TOP_K,
    });

    // --- Format output ---
    const formatted = results.documents[0].map((chunkText, i) => ({
      chunk: chunkText, // actual chunk content
      file: results.metadatas?.[0]?.[i]?.file ?? "unknown",
      distance: results.distances?.[0]?.[i] ?? null, // cosine distance/similarity
    }));

    return NextResponse.json({ results: formatted });
  } catch (error: any) {
    console.error("Error during retrieval:", error);
    return NextResponse.json(
      { error: "Failed to retrieve documents", details: error.message },
      { status: 500 }
    );
  }
}
