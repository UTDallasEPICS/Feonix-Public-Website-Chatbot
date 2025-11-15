import { ChromaClient } from "chromadb";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const COLLECTION = process.env.CHROMA_COLLECTION || "documents_collection";
const DO_DELETE = process.argv.includes("--delete");

function hashText(s) {
    // simple stable hash for small strings
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
        h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    }
    return h.toString(16);
}

async function main() {
    const client = new ChromaClient({ path: CHROMA_URL });
    console.log(`Connecting to Chroma at ${CHROMA_URL}, collection=${COLLECTION}`);

    let collection;
    try {
        collection = await client.getCollection({ name: COLLECTION });
    } catch (e) {
        console.error("Collection not found or error getting collection:", e.message || e);
        process.exit(2);
    }

    const snapshot = await collection.get({ include: ["documents", "metadatas", "ids"] });
    const docsRaw = snapshot.documents ?? [];
    const metasRaw = snapshot.metadatas ?? [];
    const idsRaw = snapshot.ids ?? [];
    const docs = Array.isArray(docsRaw[0]) ? docsRaw[0] : docsRaw;
    const metas = Array.isArray(metasRaw[0]) ? metasRaw[0] : metasRaw;
    const ids = Array.isArray(idsRaw[0]) ? idsRaw[0] : idsRaw;

    const seen = new Map(); // map hash -> { id, index, meta }
    const duplicates = [];

    for (let i = 0; i < docs.length; i++) {
        const text = String(docs[i] ?? "").trim();
        const key = hashText(text + "|" + (metas?.[i]?.fileName ?? metas?.[i]?.file ?? ""));
        const id = ids?.[i] ?? String(i);
        if (seen.has(key)) {
            duplicates.push({ id, index: i, file: metas?.[i], snippet: text.slice(0, 150) });
        } else {
            seen.set(key, { id, index: i, meta: metas?.[i] });
        }
    }

    if (duplicates.length === 0) {
        console.log("No duplicate chunks found.");
        process.exit(0);
    }

    console.log(`Found ${duplicates.length} duplicate chunks. Sample:`);
    console.log(duplicates.slice(0, 10));

    if (!DO_DELETE) {
        console.log("Run this script with '--delete' to remove the duplicate chunk ids listed above.");
        process.exit(0);
    }

    const idsToDelete = duplicates.map((d) => d.id);
    console.log(`Deleting ${idsToDelete.length} duplicate ids...`);
    const res = await collection.delete({ ids: idsToDelete });
    console.log("Delete result:", res);
    console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
