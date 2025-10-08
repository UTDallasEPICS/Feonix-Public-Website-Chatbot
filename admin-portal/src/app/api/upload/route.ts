import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { prisma } from "../../../../lib/prisma"

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files uploaded" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const savedFiles: any[] = [];
    const errors: any[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push({ name: file.name, error: "Unsupported file type" });
        continue;
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const safeOriginalName = file.name.replace(/\s+/g, "_");
      const storedName = `${Date.now()}_${safeOriginalName}`;
      const filePath = path.join(uploadDir, storedName);
      await writeFile(filePath, buffer);

      try {
        await prisma.file.create({
          data: {
            originalName: file.name,
            storedName,
            fileSize: file.size,
            fileType: file.type,
            savedTo: `/uploads/${storedName}`,
          },
        });

        savedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          savedTo: `/uploads/${storedName}`,
        });
      } catch (dbError) {
        console.error("Database insert error:", dbError);
        errors.push({ name: file.name, error: "Failed to save metadata" });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      uploaded: savedFiles,
      failed: errors,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Server error while uploading files" },
      { status: 500 }
    );
  }
}