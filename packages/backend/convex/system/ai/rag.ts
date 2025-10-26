import { google } from "@ai-sdk/google";
import { RAG } from "@convex-dev/rag";
import { components } from "../../_generated/api";

const rag = new RAG(components.rag, {
    textEmbeddingModel: google.textEmbedding("gemini-embedding-001"),
    embeddingDimension: 1536
});

export default rag;