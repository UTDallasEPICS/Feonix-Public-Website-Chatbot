import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { getOrCreateCollection } from "../../../../lib/chroma";


export async function DELETE(
  request: Request,
   { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fileId = Number(id);

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

    // find vector IDs
    const result = await collection.get({
      where: { fileId },
      limit: 99999,
    });

    const idsToDelete = result.ids ?? [];

    if (idsToDelete.length > 0) {
      await collection.delete({ ids: idsToDelete });
    }

    await prisma.document.delete({ where: { id: fileId } });

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
