import { NextRequest, NextResponse } from 'next/server';
import { ChatOllama } from "@langchain/ollama";
import { augment } from "../../../../lib/utils";

export async function GET() {
  return NextResponse.json({ test : "Message" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // from server
    // breaking down body params
    const prompt = (body.prompt ?? body.message) as string | undefined;
    const history = (body.history as Object[]) ?? [];
    const context = (body.context as Object[]) ?? [];

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    let newPrompt = augment(history, context, prompt); // modified prompt
    // model instantiation
    const llm = new ChatOllama({
      model: "gpt-oss:20b",
      temperature: 0,
      maxRetries: 2,
    });
    let response = (await llm.invoke(newPrompt)).content;

    return NextResponse.json({"response": response}); // return response
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}