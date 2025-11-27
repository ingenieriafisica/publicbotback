import { Injectable, HttpException, HttpStatus, Logger, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Model } from 'mongoose';
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { Localvector } from './entities/vectorlocal.schema';
import { BaseRetriever } from "@langchain/core/retrievers";
import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Document } from "@langchain/core/documents";

import * as dotenv from 'dotenv';
dotenv.config();

// Helper function for fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

@Injectable()
export class LocalragService implements OnModuleInit, OnModuleDestroy {
    private collection: any;
    private client: MongoClient;
    private vectorStore: MongoDBAtlasVectorSearch;
    private readonly logger = new Logger(LocalragService.name);
    private ollamaEmbeddingModel: string = 'qwen2.5:3b';
    private ollamaGenerationModel: string = 'mistral';
    private ollamaLLM: Ollama;
    private readonly embeddingDimension: number = 1024;
    private readonly ollamaTimeout: number = 30000;

    constructor(@Inject('LOCAL_VECTOR_MODEL') private vectorModel: Model<Localvector>) {
        this.ollamaLLM = new Ollama({
            model: this.ollamaGenerationModel,
            baseUrl: "http://localhost:11434",
            temperature: 0.1,
            numCtx: 4096,
        });
    }

    async onModuleInit() {
        await this.connectToDB();
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.close();
        }
    }

    private async connectToDB() {
        try {
            this.client = new MongoClient(process.env.MONGODB_ATLAS_URI);
            await this.client.connect();
            this.logger.log('Conectado a MongoDB Atlas');

            this.collection = this.client
                .db(process.env.MONGODB_ATLAS_DB_NAME)
                .collection(process.env.MONGODB_ATLAS_LOCAL_VECTORS);

            // Inicializar vectorStore con embeddings personalizados
            this.vectorStore = new MongoDBAtlasVectorSearch(this.customEmbeddings.bind(this), {
                collection: this.collection,
                indexName: "vector_index",
                textKey: "document",
                embeddingKey: "embedding",
            });

            // Verificar que el índice vectorial existe
            await this.ensureVectorIndex();

        } catch (error) {
            this.logger.error(`Error al conectar a MongoDB Atlas: ${error.message}`);
            throw error;
        }
    }

    private async ensureVectorIndex() {
        try {
            const indexes = await this.collection.indexes();
            const vectorIndexExists = indexes.some(index => index.name === "vector_index");

            if (!vectorIndexExists) {
                this.logger.log('Creando índice vectorial...');

                // Para MongoDB Atlas o local con search indexes
                await this.collection.createIndex(
                    { embedding: "vector" },
                    {
                        name: "vector_index",
                        "vector.options": {
                            type: "hnsw",
                            similarity: "cosine",
                            dimensions: this.embeddingDimension
                        }
                    }
                );

                this.logger.log('Índice vectorial creado exitosamente');
            } else {
                this.logger.log('Índice vectorial ya existe');
            }
        } catch (error) {
            this.logger.error(`Error creando índice vectorial: ${error.message}`);
            this.logger.warn('Continuando sin índice vectorial. Algunas funcionalidades pueden no estar disponibles.');
        }
    }

    // Función de embeddings personalizada corregida con timeout
    private async customEmbeddings(texts: string[]): Promise<number[][]> {
        try {
            const embeddings: number[][] = [];

            for (const text of texts) {
                const response = await fetchWithTimeout(
                    'http://localhost:11434/api/embeddings',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            model: this.ollamaEmbeddingModel,
                            prompt: text
                        }),
                    },
                    this.ollamaTimeout
                );

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`Embeddings API error: ${response.status} - ${errorBody}`);
                }

                const data = await response.json();

                // Validar la dimensión del embedding
                if (data.embedding && data.embedding.length === this.embeddingDimension) {
                    embeddings.push(data.embedding);
                } else {
                    this.logger.warn(`Embedding con dimensión incorrecta: ${data.embedding?.length}. Esperado: ${this.embeddingDimension}`);
                    // Crear embedding de fallback con dimensión correcta
                    const fallbackEmbedding = Array(this.embeddingDimension).fill(0);
                    embeddings.push(fallbackEmbedding);
                }
            }

            this.logger.log(`Generados ${embeddings.length} embeddings de ${this.embeddingDimension} dimensiones`);
            return embeddings;
        } catch (error) {
            if (error.name === 'AbortError') {
                this.logger.error(`Timeout generando embeddings con ${this.ollamaEmbeddingModel}`);
            } else {
                this.logger.error(`Error al generar embeddings con ${this.ollamaEmbeddingModel}: ${error.message}`);
            }
            // Retornar embeddings de fallback
            return texts.map(() => Array(this.embeddingDimension).fill(0));
        }
    }

    // Resto del código permanece igual...
    private createChunks(articleContent: string, metadata: Record<string, any>): Document[] {
        const chunks: Document[] = [];
        const paragraphs = articleContent.split('\n\n').filter(p => p.trim().length > 0);

        for (const paragraph of paragraphs) {
            const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
            let currentChunk = '';
            let currentChunkSize = 0;
            const targetChunkSize = 500;

            for (const sentence of sentences) {
                const sentenceWithPunctuation = sentence.trim() + '.';
                const sentenceSize = sentenceWithPunctuation.length;

                if (currentChunkSize + sentenceSize > targetChunkSize && currentChunk) {
                    chunks.push(new Document({
                        pageContent: currentChunk.trim(),
                        metadata: {
                            ...metadata,
                            chunkId: uuidv4(),
                            chunkSize: currentChunkSize
                        }
                    }));
                    currentChunk = sentenceWithPunctuation + ' ';
                    currentChunkSize = sentenceSize;
                } else {
                    currentChunk += sentenceWithPunctuation + ' ';
                    currentChunkSize += sentenceSize;
                }
            }

            if (currentChunk.trim()) {
                chunks.push(new Document({
                    pageContent: currentChunk.trim(),
                    metadata: {
                        ...metadata,
                        chunkId: uuidv4(),
                        chunkSize: currentChunkSize
                    }
                }));
            }
        }

        return chunks.filter(c => c.pageContent.length > 30);
    }

    private cleanArticleContent(articleContent: string): string {
        let cleanedContent = articleContent
            .replace(/^import .*\n?/gm, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return cleanedContent;
    }

    public async indexArticle(filePath: string): Promise<{ success: boolean; chunks: number; message: string }> {
        this.logger.log(`Indexando archivo: ${filePath}`);

        const fileName = path.basename(filePath);
        const slug = fileName.replace(path.extname(fileName), '');

        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const cleanedContent = this.cleanArticleContent(fileContent);

            if (!cleanedContent || cleanedContent.length < 50) {
                throw new Error('El contenido del archivo es demasiado corto o vacío');
            }

            const metadata = {
                slug: slug,
                source: filePath,
                title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                indexedAt: new Date().toISOString(),
                embeddingModel: this.ollamaEmbeddingModel,
                dimension: this.embeddingDimension
            };

            const documents = this.createChunks(cleanedContent, metadata);

            if (documents.length === 0) {
                throw new Error('No se crearon fragmentos válidos a partir del documento');
            }

            this.logger.log(`Procesando ${documents.length} fragmentos...`);

            const docsToStore = [];
            for (let i = 0; i < documents.length; i++) {
                const doc = documents[i];
                this.logger.log(`Generando embedding para fragmento ${i + 1}/${documents.length}`);

                const embedding = (await this.customEmbeddings([doc.pageContent]))[0];

                docsToStore.push({
                    document: doc.pageContent,
                    embedding: embedding,
                    chunkId: doc.metadata.chunkId,
                    ...doc.metadata
                });

                if (i % 5 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            if (docsToStore.length > 0) {
                await this.vectorModel.insertMany(docsToStore);
                this.logger.log(`Se indexaron con éxito ${docsToStore.length} fragmentos para ${fileName}`);
            }

            return {
                success: true,
                chunks: docsToStore.length,
                message: `Se indexaron con éxito ${docsToStore.length} fragmentos usando ${this.ollamaEmbeddingModel}`
            };
        } catch (error) {
            this.logger.error(`Error al indexar el archivo ${filePath}: ${error.message}`);
            throw new HttpException(
                `La indexación del documento falló: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async ragSearch(question: string): Promise<{ answer: string; sources: any[] }> {
        try {
            if (!this.vectorStore) {
                throw new Error('Vector store no inicializado');
            }

            const retriever: BaseRetriever = this.vectorStore.asRetriever({
                k: 4,
                searchType: "similarity"
            });

            const promptTemplate = `
Eres un asistente de IA útil y preciso. Responde la pregunta del usuario basándote únicamente en el contexto proporcionado.

Contexto proporcionado:
{context}

Pregunta del usuario: {question}

Instrucciones:
1. Si la información del contexto es relevante y suficiente, proporciona una respuesta clara y concisa
2. Si el contexto no contiene información relevante, di claramente: "No tengo suficiente información en mi base de conocimiento para responder a esta pregunta de manera precisa."
3. Mantén la respuesta enfocada y basada únicamente en el contexto proporcionado
4. Cita las fuentes relevantes cuando sea apropiado

Respuesta:`;

            const prompt = PromptTemplate.fromTemplate(promptTemplate);

            const chain = RunnableSequence.from([
                {
                    context: retriever.pipe(docs => {
                        if (!docs || docs.length === 0) {
                            return "No se encontró información relevante en el contexto.";
                        }
                        const context = docs.map((doc, index) =>
                            `[Fuente ${index + 1}: ${doc.metadata.title || doc.metadata.source}]\n${doc.pageContent}`
                        ).join("\n\n");
                        return context;
                    }),
                    question: new RunnablePassthrough(),
                },
                prompt,
                this.ollamaLLM,
                new StringOutputParser(),
            ]);

            this.logger.log(`Buscando respuesta para: "${question}"`);
            const result = await chain.invoke(question);

            const relevantDocs = await retriever.getRelevantDocuments(question);
            const sources = relevantDocs.map(doc => ({
                title: doc.metadata.title || 'Sin título',
                slug: doc.metadata.slug,
                source: doc.metadata.source,
                content: doc.pageContent.substring(0, 150) + '...',
                similarity: doc.metadata.score || 0
            }));

            this.logger.log(`Respuesta RAG generada con ${sources.length} fuentes`);
            return {
                answer: result,
                sources: sources
            };
        } catch (error) {
            this.logger.error(`Error durante la búsqueda RAG: ${error.message}`);
            throw new HttpException(
                `La búsqueda RAG falló: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getSystemStatus(): Promise<{
        database: string;
        ollama: string;
        embeddingModel: string;
        llmModel: string;
        embeddingDimension: number;
        vectorIndex: string;
        ollamaConnection: string;
    }> {
        try {
            let dbStatus = 'disconnected';
            try {
                await this.client.db().admin().ping();
                dbStatus = 'connected';
            } catch (error) {
                dbStatus = 'error';
            }

            let ollamaStatus = 'disconnected';
            let embeddingTest = 'failed';
            let ollamaConnection = 'disconnected';

            try {
                const ollamaResponse = await fetchWithTimeout(
                    'http://localhost:11434/api/tags',
                    {},
                    5000
                );
                ollamaStatus = ollamaResponse.ok ? 'connected' : 'disconnected';
                ollamaConnection = ollamaResponse.ok ? 'connected' : 'disconnected';

                const testEmbedding = await this.customEmbeddings(['test']);
                if (testEmbedding[0] && testEmbedding[0].length === this.embeddingDimension) {
                    embeddingTest = 'working';
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    ollamaStatus = 'timeout';
                    ollamaConnection = 'timeout';
                } else {
                    ollamaStatus = 'error';
                    ollamaConnection = 'error';
                }
            }

            let vectorIndexStatus = 'unknown';
            try {
                const indexes = await this.collection.indexes();
                const vectorIndex = indexes.find(index => index.name === "vector_index");
                vectorIndexStatus = vectorIndex ? 'exists' : 'missing';
            } catch (error) {
                vectorIndexStatus = 'error';
            }

            return {
                database: dbStatus,
                ollama: ollamaStatus,
                embeddingModel: `${this.ollamaEmbeddingModel} (${embeddingTest})`,
                llmModel: this.ollamaGenerationModel,
                embeddingDimension: this.embeddingDimension,
                vectorIndex: vectorIndexStatus,
                ollamaConnection: ollamaConnection
            };
        } catch (error) {
            return {
                database: 'error',
                ollama: 'error',
                embeddingModel: this.ollamaEmbeddingModel,
                llmModel: this.ollamaGenerationModel,
                embeddingDimension: this.embeddingDimension,
                vectorIndex: 'error',
                ollamaConnection: 'error'
            };
        }
    }

    async cleanupVectors(): Promise<{ deletedCount: number }> {
        try {
            const result = await this.vectorModel.deleteMany({
                embeddingModel: { $ne: this.ollamaEmbeddingModel }
            });

            this.logger.log(`Limpiados ${result.deletedCount} vectores con modelos antiguos`);
            return { deletedCount: result.deletedCount };
        } catch (error) {
            this.logger.error(`Error limpiando vectores: ${error.message}`);
            throw new HttpException(
                `Error limpiando vectores: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}