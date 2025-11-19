import { NextResponse } from "next/server";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import {
    getChromaClient,
    getOrCreateCollection,
    CHROMA_COLLECTION,
} from "../../../lib/chroma";

const DEFAULT_EMBED_MODEL = process.env.EMBED_MODEL || "BAAI/bge-m3";

// Simple tokenizer -> lowercase, split on non-word
function tokenize(text: string) {
    return text
        .toLowerCase()
        .split(/\W+/)
        .filter((t) => t.length > 0);
}

// Count matched tokens (simple term-frequency score)
function keywordScore(doc: string, terms: string[]) {
    if (!doc) return 0;
    const dTokens = tokenize(doc);
    if (dTokens.length === 0) return 0;
    const freq: Record<string, number> = {};
    for (const t of dTokens) freq[t] = (freq[t] || 0) + 1;
    let score = 0;
    for (const term of terms) score += freq[term] || 0;
    // normalize by length to prefer dense matches
    return score / Math.sqrt(dTokens.length);
}

function cosine(a: number[], b: number[]) {
    const dot = a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
    const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    return na === 0 || nb === 0 ? 0 : dot / (na * nb);
}

interface RetrievedItem {
    chunk: string;
    file?: string;
    distance?: number | null;
    rerankScore?: number | null;
}

export async function POST(req: Request) {
    console.time("retrieve_total");
    try {
        const body = await req.json();
        const query = body?.query;
        const method = body?.method || "vector"; // 'vector' | 'keyword' | 'hybrid'
        const top_k = Number(body?.top_k || 5);
        const useReranker = Boolean(body?.useReranker);

        if (!query || typeof query !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid 'query' string" },
                { status: 400 }
            );
        }

        const embeddings = new HuggingFaceInferenceEmbeddings({
            apiKey: process.env.HUGGINGFACE_API_KEY,
            model: process.env.EMBED_MODEL || DEFAULT_EMBED_MODEL,
        });

        const client = getChromaClient();
        // ensure collection exists with same embedding function
        const collection = await getOrCreateCollection(embeddings);

        if (method === "keyword") {
            console.time("retrieve_keyword_fetch_all");
            // pull all documents (simple approach; may need pagination for large corpora)
            const all = await collection.get({ include: ["documents", "metadatas"] });
            console.timeEnd("retrieve_keyword_fetch_all");

            const terms = tokenize(query);
            // normalize Chroma get() shapes - some clients return array-of-arrays, others return flat arrays
            const docsRaw = all.documents ?? [];
            const metasRaw = all.metadatas ?? [];
            const docsArray: any[] = Array.isArray(docsRaw[0]) ? docsRaw[0] : docsRaw;
            const metasArray: any[] = Array.isArray(metasRaw[0]) ? metasRaw[0] : metasRaw;

            const docs: { chunk: string; meta: any; score: number }[] = (docsArray || []).map((doc: string, i: number) => ({
                chunk: doc,
                meta: metasArray?.[i] ?? null,
                score: keywordScore(String(doc ?? ""), terms),
            }));

            const sorted = docs
                .filter((d) => d.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, top_k)
                .map((d) => ({ chunk: d.chunk, file: d.meta?.fileName ?? d.meta?.file ?? "unknown", score: d.score }));

            console.timeEnd("retrieve_total");
            return NextResponse.json({ results: sorted });
        }

        // Hybrid: combine vector and keyword search, rerank, and return top K
        if (method === "hybrid") {
            console.time("retrieve_hybrid_vector");
            const queryEmbedding = await embeddings.embedQuery(query);
            const vectorResults = await collection.query({
                queryEmbeddings: [queryEmbedding],
                nResults: Math.max(top_k * 2, 20), // fetch more for reranking
            });
            console.timeEnd("retrieve_hybrid_vector");

            let vectorChunks: RetrievedItem[] = ((vectorResults.documents?.[0] || []) as any[]).map((chunkText: string, i: number) => ({
                chunk: chunkText,
                file: String(vectorResults.metadatas?.[0]?.[i]?.fileName ?? vectorResults.metadatas?.[0]?.[i]?.file ?? "unknown"),
                distance: vectorResults.distances?.[0]?.[i] ?? null,
            }));

            // Keyword search over all docs
            console.time("retrieve_hybrid_keyword");
            const all = await collection.get({ include: ["documents", "metadatas"] });
            const terms = tokenize(query);
            const docsRaw = all.documents ?? [];
            const metasRaw = all.metadatas ?? [];
            const docsArray: any[] = Array.isArray(docsRaw[0]) ? docsRaw[0] : docsRaw;
            const metasArray: any[] = Array.isArray(metasRaw[0]) ? metasRaw[0] : metasRaw;
            let keywordChunks: RetrievedItem[] = (docsArray || []).map((doc: string, i: number) => ({
                chunk: doc,
                file: String(metasArray?.[i]?.fileName ?? metasArray?.[i]?.file ?? "unknown"),
                distance: null,
                rerankScore: keywordScore(String(doc ?? ""), terms),
            }));
            // Only keep those with some keyword match
            keywordChunks = keywordChunks.filter((d) => (d.rerankScore ?? 0) > 0);
            // Take top N by keyword score
            keywordChunks = keywordChunks.sort((a, b) => (b.rerankScore ?? 0) - (a.rerankScore ?? 0)).slice(0, Math.max(top_k * 2, 20));
            console.timeEnd("retrieve_hybrid_keyword");

            // Merge and deduplicate by chunk+file
            const seen = new Set<string>();
            const allCandidates: RetrievedItem[] = [...vectorChunks, ...keywordChunks].filter((item) => {
                const key = item.chunk + "|" + item.file;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            // Rerank all candidates
            let reranked: RetrievedItem[] = allCandidates;
            if (useReranker) {
                console.time("retrieve_hybrid_rerank");
                const rerankModel = process.env.RERANK_EMBED_MODEL || process.env.EMBED_MODEL || DEFAULT_EMBED_MODEL;
                const reranker = new HuggingFaceInferenceEmbeddings({
                    apiKey: process.env.HUGGINGFACE_API_KEY,
                    model: rerankModel,
                });
                const candidateTexts: string[] = reranked.map((f: RetrievedItem) => f.chunk);
                const [qEmb, candidateEmbeds] = await Promise.all([
                    reranker.embedQuery(query),
                    reranker.embedDocuments(candidateTexts),
                ]);
                reranked = reranked.map((f: RetrievedItem, i: number) => ({
                    ...f,
                    rerankScore: cosine(qEmb, candidateEmbeds[i]),
                }));
                // Sort by rerankScore desc
                reranked = reranked.sort((a: RetrievedItem, b: RetrievedItem) => (b.rerankScore ?? 0) - (a.rerankScore ?? 0));
                console.timeEnd("retrieve_hybrid_rerank");
            }
            // Return top K
            console.timeEnd("retrieve_total");
            return NextResponse.json({ results: reranked.slice(0, top_k) });
        }

        // Default: vector retrieval
        console.time("retrieve_embed_query");
        const queryEmbedding = await embeddings.embedQuery(query);
        console.timeEnd("retrieve_embed_query");

        console.time("retrieve_chroma_query");
        const results = await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: top_k,
        });
        console.timeEnd("retrieve_chroma_query");

        let formatted: RetrievedItem[] = ((results.documents?.[0] || []) as any[]).map((chunkText: string, i: number) => ({
            chunk: chunkText,
            file: String(results.metadatas?.[0]?.[i]?.fileName ?? results.metadatas?.[0]?.[i]?.file ?? "unknown"),
            distance: results.distances?.[0]?.[i] ?? null,
        }));

        if (useReranker) {
            console.time("retrieve_rerank");
            const rerankModel = process.env.RERANK_EMBED_MODEL || process.env.EMBED_MODEL || DEFAULT_EMBED_MODEL;
            const reranker = new HuggingFaceInferenceEmbeddings({
                apiKey: process.env.HUGGINGFACE_API_KEY,
                model: rerankModel,
            });

            const candidateTexts: string[] = formatted.map((f: RetrievedItem) => f.chunk);
            // embed candidates and query with reranker model
            const [qEmb, candidateEmbeds] = await Promise.all([
                reranker.embedQuery(query),
                reranker.embedDocuments(candidateTexts),
            ]);

            const withScores = formatted.map((f: RetrievedItem, i: number) => ({
                ...f,
                rerankScore: cosine(qEmb, candidateEmbeds[i]),
            }));

            // sort by rerankScore desc
            formatted = withScores.sort((a: RetrievedItem, b: RetrievedItem) => (b.rerankScore ?? 0) - (a.rerankScore ?? 0));
            console.timeEnd("retrieve_rerank");
        }

        console.timeEnd("retrieve_total");
        return NextResponse.json({ results: formatted });
    } catch (error: any) {
        console.error("Error during retrieval:", error);
        console.timeEnd("retrieve_total");
        return NextResponse.json(
            { error: "Failed to retrieve documents", details: error?.message ?? String(error) },
            { status: 500 }
        );
    }
}
