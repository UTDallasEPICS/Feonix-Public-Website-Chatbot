import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const message = body.message || '';

  return NextResponse.json({
    reply: `You said: ${message}`,
  });
}
