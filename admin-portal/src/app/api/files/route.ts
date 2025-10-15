import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma"

export async function GET() {
  try {
    const files = await prisma.document.findMany({
      orderBy: { uploadedAt: "desc" },
    });
    return NextResponse.json({ files });
  } catch (err) {
    console.error("Error reading files:", err);
    return NextResponse.json({ error: "Failed to read files" }, { status: 500 });
  }
}
