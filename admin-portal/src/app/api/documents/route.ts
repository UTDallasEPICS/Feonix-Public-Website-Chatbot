import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
    try {
        const documents = await prisma.document.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: true, 
            },
        });

        const mapped = documents.map((d) => ({
            id: d.id,
            name: d.fileName || "",
            fileType: d.fileType || null,
            fileSize: d.fileSize || null,
            createdAt: d.createdAt,
            user: {
                id: d.user.id,
                name: d.user.name,
            }, 
        }));

        return NextResponse.json({ documents: mapped });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
    }
}
