import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

// Helper: Extract text from PDF
async function extractPdfText(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

// Helper: Extract text from DOCX
async function extractDocxText(filePath: string): Promise<string> {
  const data = await mammoth.extractRawText({ path: filePath });
  return data.value;
}

// Helper: Extract text from TXT
async function extractTxtText(filePath: string): Promise<string> {
  return fs.readFileSync(filePath, "utf8");
}

// Helper: Split text into chunks (simple sentence/paragraph split)
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

// POST handler for document ingestion
export async function POST(req: NextRequest) {
  // Parse multipart form data
  const form = formidable({ multiples: false, uploadDir: "/tmp", keepExtensions: true });

  const formData = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });


  let file: formidable.File | undefined;
  const uploaded = formData.files.file;
  if (Array.isArray(uploaded)) {
    file = uploaded[0];
  } else {
    file = uploaded as formidable.File | undefined;
  }
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  let text = "";
  const ext = path.extname(file.originalFilename || file.newFilename).toLowerCase();

  try {
    if (ext === ".pdf") {
      text = await extractPdfText(file.filepath);
    } else if (ext === ".docx") {
      text = await extractDocxText(file.filepath);
    } else if (ext === ".txt") {
      text = await extractTxtText(file.filepath);
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: "Failed to extract text" }, { status: 500 });
  }

  // Split text into chunks
  const chunks = splitText(text);

  // Clean up uploaded file
  fs.unlinkSync(file.filepath);

  return NextResponse.json({ chunks });
}