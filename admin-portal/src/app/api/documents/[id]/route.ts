import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import path from "path";
import { readFile, unlink } from "fs/promises";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const id = Number(parts[parts.length - 1]);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // determine filename stored on disk - earlier migrations sometimes used `title` or `fileName`
    const fileName = ((doc as unknown) as { title?: string; fileName?: string }).title ||
        ((doc as unknown) as { title?: string; fileName?: string }).fileName ||
        `document-${doc.id}`;
    const filePath = path.join(process.cwd(), "uploads", fileName);

    try {
        const data = await readFile(filePath);
        // Node Buffer -> ArrayBuffer for NextResponse
    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    const headers = new Headers();
    headers.set("Content-Type", ((doc as unknown) as { fileType?: string }).fileType || "application/octet-stream");
    headers.set("Content-Disposition", `inline; filename="${fileName}"`);
    const uint8 = new Uint8Array(arrayBuffer as ArrayBuffer);
    return new Response(uint8, { headers, status: 200 });
    } catch (err) {
        console.error("File read error", err);
        return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
    }
}

export async function DELETE(request: Request) {
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const id = Number(parts[parts.length - 1]);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const fileName = ((doc as unknown) as { title?: string; fileName?: string }).title ||
        ((doc as unknown) as { title?: string; fileName?: string }).fileName ||
        `document-${doc.id}`;
    const filePath = path.join(process.cwd(), "uploads", fileName);

    try {
        // remove file from disk if exists
        await unlink(filePath).catch((e) => {
            console.warn("Could not unlink file, continuing: ", e.message || e);
        });

        // delete db record
        await prisma.document.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delete error", err);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
