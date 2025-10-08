import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "../../../../../lib/prisma"


const uploadDir = path.join(process.cwd(), "uploads");

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const fileId = parseInt(params.id, 10);
    if (isNaN(fileId)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const fileRecord = await prisma.file.findUnique({ where: { id: fileId } });
    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filePath = path.join(uploadDir, fileRecord.storedName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.file.delete({ where: { id: fileId } });

    return NextResponse.json({ success: true, deleted: fileRecord.originalName });
  } 
  catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
