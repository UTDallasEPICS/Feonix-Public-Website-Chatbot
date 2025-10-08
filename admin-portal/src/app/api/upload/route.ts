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

        const savedFiles: any[] = [];
        const errors: any[] = [];

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
                        title: file.name,
                        fileType: file.type,
                        fileSize: file.size,
                    },
                });
            } catch (dbError) {
                console.error("Database insert error:", dbError);
                errors.push({ name: file.name, error: "Failed to save metadata" });
                continue;
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