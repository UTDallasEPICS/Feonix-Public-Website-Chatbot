import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const documents = await prisma.file.findMany();
  return NextResponse.json({ documents });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, content } = body;

  const storedName = `${Date.now()}_placeholder.txt`;

  const created = await prisma.file.create({
    data: {
      fileName: title || `doc-${Date.now()}`,
      fileSize: 0,
      fileType: typeof content === "string" ? "text/plain" : "application/octet-stream",
      savedTo: `/uploads/${storedName}`,
    },
  });

  return NextResponse.json(created);
}
