import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
    try {
        const documents = await prisma.document.findMany({ orderBy: { createdAt: "desc" } });
        // Map DB fields to a stable shape expected by the frontend
        const mapped = documents.map((d) => ({
            id: d.id,
            name: d.fileName || "",
            fileType: d.fileType || null,
            fileSize: d.fileSize || null,
            createdAt: d.createdAt,
        }));

        return NextResponse.json({ documents: mapped });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
    }
}
