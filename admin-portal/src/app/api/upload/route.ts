import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import fs from "fs";
import path from "path";
import { existsSync } from "fs";
import { prisma } from "../../../../lib/prisma"

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { ChromaClient } from "chromadb";

export const runtime = "nodejs";

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];


const chroma = new ChromaClient({ path: "http://localhost:8000" });

async function getCollection(embeddings: any) {
  return chroma.getOrCreateCollection({
    name: "documents_collection",
    embeddingFunction: embeddings
  });
}

async function loadText(filePath: string, ext: string) {
  let loader;

  switch (ext) {
    case ".pdf":
      loader = new PDFLoader(filePath);
      break;
    case ".docx":
      loader = new DocxLoader(filePath);
      break;
    case ".txt":
      loader = new TextLoader(filePath);
      break;
    default:
      return null; // Unsupported → We skip PPTX now
  }

  const docs = await loader.load();
  return docs.map((d) => d.pageContent).join("\n\n");
}


export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0)
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: "BAAI/bge-m3",
    });

    const collection = await getCollection(embeddings);

    const results: any[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        results.push({ file: file.name, status: "unsupported type" });
        continue;
      }

      const filePath = path.join(uploadDir, file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      // Save metadata → Prisma
      const docEntry = await prisma.document.create({
        data: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
      });

      const ext = path.extname(file.name).toLowerCase();
      const text = await loadText(filePath, ext);

      if (!text) {
        results.push({ file: file.name, status: "failed to extract text" });
        continue;
      }

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 150,
      });

      const chunks = await splitter.splitText(text);
      const vectors = await embeddings.embedDocuments(chunks);
      const ids = chunks.map((_, i) => `${docEntry.id}-${i}`);

      await collection.add({
        ids,
        documents: chunks,
        embeddings: vectors,
        metadatas: chunks.map((_, i) => ({
          fileId: docEntry.id,
          fileName: file.name,
          chunkIndex: i,
        })),
      });

      results.push({
        file: file.name,
        status: "uploaded + embedded",
        chunks: chunks.length,
      });
    }

    return NextResponse.json({ success: true, results });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
