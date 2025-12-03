import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

import {
    getChromaClient,
    getOrCreateCollection,
    CHROMA_COLLECTION,
} from "@/lib/chroma";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const EMBED_MODEL = process.env.EMBED_MODEL || "BAAI/bge-m3";
const RERANK_EMBED_MODEL = process.env.RERANK_EMBED_MODEL || process.env.EMBED_MODEL || "BAAI/bge-m3";

export interface RetrievedItem {
  chunk: string;
  file?: string;
  distance?: number | null;
  rerankScore?: number | null;
  keywordScore?: number | null;
  metadata?: Record<string, any>;
}

export interface RetrievalOptions {
  method?: "vector" | "keyword" | "hybrid";
  top_k?: number;
  useReranker?: boolean;
  rerankModel?: string;
  threshold?: number;
}


export class DocumentRetriever {
  private embeddings: HuggingFaceInferenceEmbeddings;
  private chromaClient: ReturnType<typeof getChromaClient>;
  private collection: any;

  constructor(
    embeddings?: HuggingFaceInferenceEmbeddings,
    chromaClient?: ReturnType<typeof getChromaClient>
  ) {
    this.embeddings =
      embeddings ??
      new HuggingFaceInferenceEmbeddings({
        apiKey: HUGGINGFACE_API_KEY,
        model: EMBED_MODEL,
      });
    
    this.chromaClient = chromaClient ?? getChromaClient();
  }

  async initialize(): Promise<this> {
    if (!this.collection) {
      this.collection = await getOrCreateCollection(this.embeddings);
    }
    return this;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter((t) => t.length > 0);
  }

  private keywordScore(doc: string, terms: string[]): number {
    if (!doc) return 0;
    
    const dTokens = this.tokenize(doc);
    if (dTokens.length === 0) return 0;
    
    const freq: Record<string, number> = {};
    for (const t of dTokens) {
      freq[t] = (freq[t] || 0) + 1;
    }
    
    let score = 0;
    for (const term of terms) {
      score += freq[term] || 0;
    }
    
    return score / Math.sqrt(dTokens.length);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] ?? 0), 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    return magnitudeA === 0 || magnitudeB === 0 
      ? 0 
      : dotProduct / (magnitudeA * magnitudeB);
  }

  private normalizeChromaResults(
    documents: any[],
    metadatas: any[],
    distances?: number[]
  ): RetrievedItem[] {
    const docsArray = Array.isArray(documents[0]) ? documents[0] : documents;
    const metasArray = Array.isArray(metadatas[0]) ? metadatas[0] : metadatas;

    return (docsArray || []).map((chunk: string, i: number) => ({
      chunk: String(chunk || ""),
      file: String(
        metasArray?.[i]?.fileName ?? 
        metasArray?.[i]?.file ?? 
        "unknown"
      ),
      distance: distances?.[i] ?? null,
      metadata: metasArray?.[i] ?? {},
    }));
  }

  async keywordRetrieval(
    query: string,
    top_k: number
  ): Promise<RetrievedItem[]> {
    await this.initialize();
    
    console.time("keyword_retrieval");
    const all = await this.collection.get({
      include: ["documents", "metadatas"],
    });

    const terms = this.tokenize(query);
    const items = this.normalizeChromaResults(
      all.documents ?? [],
      all.metadatas ?? []
    );

    const scoredItems = items
      .map((item) => ({
        ...item,
        keywordScore: this.keywordScore(item.chunk, terms),
      }))
      .filter((item) => item.keywordScore > 0)
      .sort((a, b) => (b.keywordScore ?? 0) - (a.keywordScore ?? 0))
      .slice(0, top_k);

    console.timeEnd("keyword_retrieval");
    return scoredItems;
  }

  async vectorRetrieval(
    query: string,
    top_k: number,
    useReranker?: boolean,
    rerankModel?: string
  ): Promise<RetrievedItem[]> {
    await this.initialize();
    
    console.time("vector_retrieval");
    
    const queryEmbedding = await this.embeddings.embedQuery(query);
    
    const results = await this.collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: top_k,
    });

    let items = this.normalizeChromaResults(
      results.documents?.[0] || [],
      results.metadatas?.[0] || [],
      results.distances?.[0] || []
    );

    if (useReranker) {
      items = await this.rerankItems(query, items, rerankModel);
    }

    console.timeEnd("vector_retrieval");
    return items;
  }

  async hybridRetrieval(
    query: string,
    top_k: number,
    useReranker?: boolean,
    rerankModel?: string
  ): Promise<RetrievedItem[]> {
    await this.initialize();
    
    console.time("hybrid_retrieval");

    const vectorItems = await this.vectorRetrieval(query, top_k * 2, false);
    
    const keywordItems = await this.keywordRetrieval(query, top_k * 2);
    
    const seen = new Set<string>();
    const mergedItems: RetrievedItem[] = [];
    
    const allItems = [...vectorItems, ...keywordItems];
    for (const item of allItems) {
      const key = `${item.chunk}|${item.file}`;
      if (!seen.has(key)) {
        seen.add(key);
        mergedItems.push(item);
      }
    }

    let finalItems = mergedItems;
    if (useReranker) {
      finalItems = await this.rerankItems(query, mergedItems, rerankModel);
    }

    console.timeEnd("hybrid_retrieval");
    return finalItems.slice(0, top_k);
  }

  private async rerankItems(
    query: string,
    items: RetrievedItem[],
    model?: string
  ): Promise<RetrievedItem[]> {
    console.time("reranking");
    
    const rerankModel = model || RERANK_EMBED_MODEL || EMBED_MODEL;

    const reranker = new HuggingFaceInferenceEmbeddings({
      apiKey: HUGGINGFACE_API_KEY,
      model: rerankModel,
    });

    const candidateTexts = items.map((item) => item.chunk);
    
    const [queryEmbedding, candidateEmbeddings] = await Promise.all([
      reranker.embedQuery(query),
      reranker.embedDocuments(candidateTexts),
    ]);

    const rerankedItems = items.map((item, index) => ({
      ...item,
      rerankScore: this.cosineSimilarity(
        queryEmbedding,
        candidateEmbeddings[index]
      ),
    }));

    rerankedItems.sort((a, b) => 
      (b.rerankScore ?? 0) - (a.rerankScore ?? 0)
    );

    console.timeEnd("reranking");
    return rerankedItems;
  }

  async retrieve(
    query: string,
    options: RetrievalOptions = {}
  ): Promise<RetrievedItem[]> {
    const {
      method = "vector",
      top_k = 5,
      useReranker = false,
      rerankModel,
    } = options;

    console.time("total_retrieval");

    try {
      let results: RetrievedItem[];

      switch (method) {
        case "keyword":
          results = await this.keywordRetrieval(query, top_k);
          break;

        case "hybrid":
          results = await this.hybridRetrieval(
            query,
            top_k,
            useReranker,
            rerankModel
          );
          break;

        case "vector":
        default:
          results = await this.vectorRetrieval(
            query,
            top_k,
            useReranker,
            rerankModel
          );
          break;
      }

      console.timeEnd("total_retrieval");
      return results;
    } catch (error) {
      console.timeEnd("total_retrieval");
      console.error("Retrieval error:", error);
      throw error;
    }
  }
}