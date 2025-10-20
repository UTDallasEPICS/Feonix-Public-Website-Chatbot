import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import os from "os";
import { Readable } from "stream";
import { IncomingMessage } from "http";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";


export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function convertRequestToNodeStream(req: NextRequest): Promise<IncomingMessage> {
  if (!req.body) throw new Error("Request body is empty");

  const nodeStream = Readable.fromWeb(req.body as any);

  const incoming = Object.assign(nodeStream, {
    headers: Object.fromEntries(req.headers.entries()),
    method: req.method,
    url: req.nextUrl.pathname,
  }) as unknown as IncomingMessage;

  return incoming;
}


function splitText(text: string, maxChunkSize = 1000): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += "\n" + para;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const nodeReq = await convertRequestToNodeStream(req);

    const form = formidable({
      uploadDir: os.tmpdir(),
      keepExtensions: true,
      multiples: false,
    });

    const { files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(nodeReq, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const uploaded = files.file;
    const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const ext = path.extname(file.originalFilename || "").toLowerCase();
    let text = "";

    try {
      let loader;
      if (ext === ".pdf") {
        loader = new PDFLoader(file.filepath);
      } else if (ext === ".docx") {
        loader = new DocxLoader(file.filepath);
      } else if (ext === ".txt") {
        loader = new TextLoader(file.filepath);
      } else if (ext === ".pptx") {
        loader = new PPTXLoader(file.filepath);
      } else {
        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
      }

      const docs = await loader.load();
      text = docs.map((doc) => doc.pageContent).join("\n\n");

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,     
        chunkOverlap: 150, 
        separators: ["\n\n", "\n", ".", "!", "?", " ", ""], 
      });

      const splitDocs = await splitter.splitDocuments(docs);

      
      const chunks = splitDocs.map((d) => d.pageContent);

      
      fs.unlinkSync(file.filepath);

      return NextResponse.json({ chunks });
    } catch (e) {
      console.error("Text extraction failed:", e);
      return NextResponse.json({ error: "Failed to extract text" }, { status: 500 });
    }

  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
