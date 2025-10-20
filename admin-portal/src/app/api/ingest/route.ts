import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";
<<<<<<< HEAD
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
=======
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

// Helper: Extract text from PDF
// async function extractPdfText(filePath: string): Promise<string> {
//   console.log("Extracting PDF text from:", filePath);


//   const dataBuffer = fs.readFileSync(filePath);
//   const parser = new PDFParse({ data: dataBuffer });
//   const result = await parser.getText();
//   await parser.destroy();
//   return result.text;
// }

// // Helper: Extract text from DOCX
// async function extractDocxText(filePath: string): Promise<string> {
//   const data = await mammoth.extractRawText({ path: filePath });
//   return data.value;
// }

// // Helper: Extract text from TXT
// async function extractTxtText(filePath: string): Promise<string> {
//   return fs.readFileSync(filePath, "utf8");
// }

// // Helper: Split text into chunks (simple sentence/paragraph split)
// function splitText(text: string, maxChunkSize = 1000): string[] {
//   const paragraphs = text.split(/\n\s*\n/);
//   const chunks: string[] = [];
//   let currentChunk = "";

//   for (const para of paragraphs) {
//     if ((currentChunk + para).length > maxChunkSize) {
//       if (currentChunk) chunks.push(currentChunk.trim());
//       currentChunk = para;
//     } else {
//       currentChunk += "\n" + para;
//     }
//   }


//   if (currentChunk) chunks.push(currentChunk.trim());
//   return chunks;
// }

// POST handler for document ingestion
export async function POST(req: NextRequest) {

  console.log("Testing");
  const form = formidable({ multiples: false, uploadDir: "/tmp", keepExtensions: true });
  // Parse multipart form data
  const formData = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req as any, (err : any, fields : any, files : any) => {
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
    return NextResponse.json({ error: "Failed to extract text" }, { status: 501 });
  }

  // Split text into chunks
  const chunks = splitText(text);

  // Clean up uploaded file
  fs.unlinkSync(file.filepath);

  return NextResponse.json({ chunks });

  
}
>>>>>>> 9dc7742c5b5acac25d34c87c4a21d172d0b5163b
