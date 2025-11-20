export class SearchQueryDto {
  /**
   * The user's question or prompt for the Retrieval-Augmented Generation (RAG) system.
   * This is typically passed as a query parameter (e.g., /rag/search?question=...).
   */
  question: string;
}