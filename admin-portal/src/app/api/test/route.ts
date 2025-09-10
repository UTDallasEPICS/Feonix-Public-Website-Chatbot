import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const documents = await prisma.document.findMany();
  return NextResponse.json({ documents });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, content } = body;

  const created = await prisma.document.create({
    data: { title, content },
  });

  return NextResponse.json(created);
}
