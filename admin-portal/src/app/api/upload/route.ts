import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { prisma } from "../../../../lib/prisma"

const ALLOWED_TYPES = ["application/pdf", "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];



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

    // Create uploads folder if it doesn't exist
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    type SavedFile = { name: string; size: number; type: string; savedTo: string };
    type ErrorItem = { name: string; error: string };

    const savedFiles: SavedFile[] = [];
    const errors: ErrorItem[] = [];

    for (const file of files) {
      // ✅ Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push({ name: file.name, error: "Unsupported file type" });
        continue;
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filePath = path.join(uploadDir, file.name);
      await writeFile(filePath, buffer);

      // Save metadata to database
      try {
        await prisma.document.create({
          data: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          },
        });
      } catch (dbError: unknown) {
        // If the DB doesn't have `fileName` (legacy schema used `title`), try fallback
        const isMissingColumn =
          (dbError as any)?.code === "P2022" ||
          String((dbError as any)?.message || "").toLowerCase().includes("filename");

        if (isMissingColumn) {
          try {
            // fallback to legacy `title` column if present
            await prisma.document.create({
              data: {
                // @ts-expect-error legacy column
                title: file.name,
                fileType: file.type,
                fileSize: file.size,
              },
            });
          } catch (legacyErr) {
            console.error("Database insert error (legacy attempt):", legacyErr);
            errors.push({ name: file.name, error: `Failed to save metadata: ${(legacyErr as any)?.message || legacyErr}` });
            continue;
          }
        } else {
          console.error("Database insert error:", dbError);
          errors.push({ name: file.name, error: `Failed to save metadata: ${(dbError as any)?.message || dbError}` });
          continue;
        }
      }

      savedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        savedTo: `/uploads/${file.name}`,
      });
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