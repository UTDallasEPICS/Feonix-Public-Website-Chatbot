import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "../../../../lib/prisma";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { getOrCreateCollection } from "../../../lib/chroma";

export const runtime = "nodejs";

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// ⭐ Load text by writing the file → reading it → deleting it
async function loadTextFromBuffer(buffer: Buffer, ext: string, fileName: string) {
  const tempPath = path.join(process.cwd(), fileName);

  // Write file temporarily
  await fs.promises.writeFile(tempPath, buffer);

  let loader;
  switch (ext) {
    case ".pdf":
      loader = new PDFLoader(tempPath);
      break;
    case ".docx":
      loader = new DocxLoader(tempPath);
      break;
    case ".txt":
      loader = new TextLoader(tempPath);
      break;
    default:
      await fs.promises.unlink(tempPath);
      return null;
  }

  // Extract text
  const docs = await loader.load();
  const text = docs.map((d) => d.pageContent).join("\n\n");

  // Delete file immediately
  await fs.promises.unlink(tempPath);

  return text;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0)
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });

    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: process.env.EMBED_MODEL || "BAAI/bge-m3",
    });

    const collection = await getOrCreateCollection(embeddings);
    const results: any[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        results.push({ file: file.name, status: "unsupported type" });
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name).toLowerCase();

      // ⭐ Load text by temp-writing the file
      const text = await loadTextFromBuffer(buffer, ext, file.name);

      if (!text) {
        results.push({ file: file.name, status: "failed to extract text" });
        continue;
      }

      // Save metadata → Prisma
      const docEntry = await prisma.document.create({
        data: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
      });

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

export async function DELETE(request: Request) {
  try {
    const { fileId } = await request.json();

    if (!fileId)
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });

    const doc = await prisma.document.findUnique({ where: { id: fileId } });

    if (!doc)
      return NextResponse.json({ error: "Document not found" }, { status: 404 });

    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: process.env.EMBED_MODEL || "BAAI/bge-m3",
    });

    const collection = await getOrCreateCollection(embeddings);

    // get vector ids
    const result = await collection.get({
      where: { fileId },
      limit: 99999,
    });

    const idsToDelete = result.ids ?? [];

    if (idsToDelete.length > 0) {
      await collection.delete({ ids: idsToDelete });
    }

    // delete prisma row
    await prisma.document.delete({
      where: { id: fileId },
    });

    return NextResponse.json({
      success: true,
      message: "Deleted document + vectors",
      deletedVectors: idsToDelete.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
