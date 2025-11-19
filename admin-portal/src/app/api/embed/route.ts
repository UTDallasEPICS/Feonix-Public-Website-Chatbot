import { NextResponse } from "next/server";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs";
import path from "path";
import { getOrCreateCollection } from "../../../lib/chroma";


// --------------------------
// GET → test endpoint
// --------------------------
export async function GET() {
  return NextResponse.json({ message: "Text embedding API active" });
}

// --------------------------
// POST → upload and index text files
// --------------------------
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save file in a local "uploads" folder in your project directory
    const uploadDir = path.join(process.cwd(), "uploads");
    fs.mkdirSync(uploadDir, { recursive: true }); // ensure folder exists

    const filePath = path.join(uploadDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);


    // Read content
    const text = fs.readFileSync(filePath, "utf8");

    // Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    const chunks = await splitter.splitText(text);

    // Embedding model
    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: process.env.EMBED_MODEL || "BAAI/bge-m3",
    });

    // Generate embeddings for chunks
    const vectors = await embeddings.embedDocuments(chunks);

    // Store in Chroma (collection and client are handled by helper)
    const collection = await getOrCreateCollection(embeddings);

    const ids = chunks.map((_, i) => `${file.name}-${i}`);

    await collection.add({
      ids,
      documents: chunks,
      embeddings: vectors,
      metadatas: chunks.map((_, i) => ({ file: file.name, chunk: i })),
    });

    return NextResponse.json({
      message: "File embedded successfully",
      chunks: chunks.length,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// --------------------------
// PUT → query existing embeddings
// --------------------------
export async function PUT(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Missing 'query'" }, { status: 400 });
    }

    // 1. Create embedding function (Hugging Face)
    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: process.env.EMBED_MODEL || "BAAI/bge-m3",
    });

    // 2. Embed the query string
    const queryEmbedding = await embeddings.embedQuery(query);

    // 3. Get Chroma collection with the same embedding function
    // ensure collection exists with same embedding function
    const collection = await getOrCreateCollection(embeddings);

    // 4. Search for most similar documents
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 5,
    });

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
