import { ChromaClient } from "chromadb";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const COLLECTION = process.env.CHROMA_COLLECTION || "documents_collection";

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

    const snapshot = await collection.get({ include: ["documents", "metadatas"] });
    const docsRaw = snapshot.documents ?? [];
    const idsRaw = snapshot.ids ?? [];
    const docs = Array.isArray(docsRaw[0]) ? docsRaw[0] : docsRaw;
    const ids = Array.isArray(idsRaw[0]) ? idsRaw[0] : idsRaw;

    console.log("total_chunks before delete:", docs.length);
    if (!ids || ids.length === 0) {
        console.log("No ids found to delete - nothing to do.");
        process.exit(0);
    }

    console.log(`Deleting ${ids.length} ids from collection ${COLLECTION} ...`);
    try {
        const res = await collection.delete({ ids });
        console.log("Delete result:", res);
        console.log("Done.");
        process.exit(0);
    } catch (e) {
        console.error("Delete failed:", e);
        process.exit(1);
    }
}

main().catch((e) => { console.error(e); process.exit(1); });
