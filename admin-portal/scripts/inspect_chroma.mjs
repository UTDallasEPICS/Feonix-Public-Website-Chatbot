import { ChromaClient } from "chromadb";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const COLLECTION = process.env.CHROMA_COLLECTION || "documents_collection";

async function main() {
    try {
        const client = new ChromaClient({ path: CHROMA_URL });
        console.log(`Connecting to Chroma at ${CHROMA_URL}, collection=${COLLECTION}`);

        // try to get collection
        let collection;
        try {
            collection = await client.getCollection({ name: COLLECTION });
        } catch (e) {
            console.error("Collection not found or error getting collection:", e.message || e);
            process.exit(2);
        }

        const snapshot = await collection.get({ include: ["documents", "metadatas"] });

        // normalize shapes
        const docsRaw = snapshot.documents ?? [];
        const metasRaw = snapshot.metadatas ?? [];
        const idsRaw = snapshot.ids ?? [];

        const docs = Array.isArray(docsRaw[0]) ? docsRaw[0] : docsRaw;
        const metas = Array.isArray(metasRaw[0]) ? metasRaw[0] : metasRaw;
        const ids = Array.isArray(idsRaw[0]) ? idsRaw[0] : idsRaw;

        console.log("total_chunks:", docs.length);

        // aggregate by fileName or file metadata
        const perFile = {};
        for (let i = 0; i < docs.length; i++) {
            const m = metas?.[i] ?? {};
            const fname = m?.fileName ?? m?.file ?? m?.fileId ?? "unknown";
            perFile[fname] = (perFile[fname] || 0) + 1;
        }

        console.log("per_file_chunk_counts:");
        console.log(perFile);

        console.log("sample ids:", ids.slice(0, 10));
        console.log("sample chunks (first 5):");
        for (let i = 0; i < Math.min(5, docs.length); i++) {
            console.log(`- [${ids[i] ?? i}] ${String(docs[i]).slice(0, 200).replace(/\n/g, ' ')}${String(docs[i]).length > 200 ? '...' : ''}`);
        }

        process.exit(0);
    } catch (err) {
        console.error("Failed to inspect Chroma:", err);
        process.exit(1);
    }
}

main();
