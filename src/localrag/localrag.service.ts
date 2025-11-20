import { Injectable, HttpException, HttpStatus, Logger, Inject } from '@nestjs/common';
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

@Injectable()
export class LocalragService {
    private collection: any;
    private client: MongoClient;
    private vectorStore: MongoDBAtlasVectorSearch;
    private readonly logger = new Logger(LocalragService.name);
    private ollamaEmbeddingModel: string = 'qwen3-embedding'; // Actualizado a Qwen2.5
    private ollamaGenerationModel: string = 'mistral';
    private ollamaLLM: Ollama;

    constructor(@Inject('LOCAL_VECTOR_MODEL') private vectorModel: Model<Localvector>) {
        this.client = new MongoClient(process.env.MONGODB_ATLAS_URI);

        // Configurar el LLM para la cadena RAG
        this.ollamaLLM = new Ollama({
            model: this.ollamaGenerationModel,
            baseUrl: "http://localhost:11434",
            temperature: 0.1,
        });

        this.connectToDB();
    }

    private async connectToDB() {
        try {
            await this.client.connect();
            this.logger.log('Conectado a MongoDB Atlas');

            this.collection = this.client
                .db(process.env.MONGODB_ATLAS_DB_NAME)
                .collection(process.env.MONGODB_ATLAS_LOCAL_VECTORS);

            // Inicializar 'vectorStore' con incrustaciones (embeddings) personalizadas
            this.vectorStore = new MongoDBAtlasVectorSearch(this.customEmbeddings.bind(this), {
                collection: this.collection,
                indexName: "default",
                textKey: "document",
                embeddingKey: "embedding",
            });
        } catch (error) {
            this.logger.error(`Error al conectar a MongoDB Atlas: ${error.message}`);
            throw error;
        }
    }

    // Función de incrustaciones (embeddings) personalizada usando Qwen2.5
    private async customEmbeddings(texts: string[]): Promise<number[][]> {
        try {
            const embeddings: number[][] = [];

            for (const text of texts) {
                const response = await fetch('http://localhost:11434/api/embeddings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: this.ollamaEmbeddingModel,
                        input: text
                    }),
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`embeddings API error: ${response.status} - ${errorBody}`);
                }

                const data = await response.json();
                embeddings.push(data.embedding);
            }

            return embeddings;
        } catch (error) {
            this.logger.error(`Error al generar incrustaciones (embeddings) con Qwen2.5: ${error.message}`);
            throw new HttpException(
                `La generación de incrustaciones falló: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Función de fragmentación mejorada
    private createChunks(articleContent: string, metadata: Record<string, any>): Document[] {
        const chunks: Document[] = [];

        // Dividir por párrafos y agrupar en fragmentos de ~500 caracteres
        const paragraphs = articleContent.split('\n\n').filter(p => p.trim().length > 0);
        let currentChunk = '';
        let currentChunkSize = 0;
        const targetChunkSize = 500;

        for (const paragraph of paragraphs) {
            const paragraphSize = paragraph.length;

            if (currentChunkSize + paragraphSize > targetChunkSize && currentChunk) {
                // Guardar el fragmento actual y comenzar uno nuevo
                chunks.push(new Document({
                    pageContent: currentChunk.trim(),
                    metadata: {
                        ...metadata,
                        chunkId: uuidv4()
                    }
                }));
                currentChunk = paragraph + '\n\n';
                currentChunkSize = paragraphSize;
            } else {
                currentChunk += paragraph + '\n\n';
                currentChunkSize += paragraphSize;
            }
        }

        // Agregar el último fragmento si existe
        if (currentChunk.trim()) {
            chunks.push(new Document({
                pageContent: currentChunk.trim(),
                metadata: {
                    ...metadata,
                    chunkId: uuidv4()
                }
            }));
        }

        return chunks.filter(c => c.pageContent.length > 50); // Filtrar fragmentos muy pequeños
    }

    private cleanArticleContent(articleContent: string): string {
        let cleanedContent = articleContent.replace(/^import .*\n?/gm, '');
        cleanedContent = cleanedContent.replace(/<[^>]+>/g, '');
        // Eliminar el exceso de espacios en blanco
        cleanedContent = cleanedContent.replace(/\s+/g, ' ').trim();
        return cleanedContent;
    }

    public async indexArticle(filePath: string): Promise<{ success: boolean; chunks: number; message: string }> {
        this.logger.log(`Indexando archivo: ${filePath}`);

        const fileName = path.basename(filePath);
        const slug = fileName.replace(path.extname(fileName), '');

        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const cleanedContent = this.cleanArticleContent(fileContent);

            const metadata = {
                slug: slug,
                source: filePath,
                // Mejor generación de título
                title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                indexedAt: new Date().toISOString(),
            };

            const documents = this.createChunks(cleanedContent, metadata);

            if (documents.length === 0) {
                throw new Error('No se crearon fragmentos válidos a partir del documento');
            }

            // Preparar documentos para el almacenamiento
            const docsToStore = await Promise.all(
                documents.map(async (doc) => {
                    const embedding = (await this.customEmbeddings([doc.pageContent]))[0];
                    return {
                        document: doc.pageContent,
                        embedding: embedding,
                        chunkId: doc.metadata.chunkId,
                        ...doc.metadata
                    };
                })
            );

            // Usar Mongoose para guardar los documentos
            await this.vectorModel.insertMany(docsToStore);

            this.logger.log(`Se indexaron con éxito ${docsToStore.length} fragmentos para ${fileName}`);
            return {
                success: true,
                chunks: docsToStore.length,
                message: `Se indexaron con éxito ${docsToStore.length} fragmentos`
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
            const retriever: BaseRetriever = this.vectorStore.asRetriever({
                k: 5 // Reducido para un mejor rendimiento
            });

            const prompt = PromptTemplate.fromTemplate(`
Eres un asistente de IA útil y preciso. Responde la pregunta del usuario basándote únicamente en el contexto proporcionado.

Contexto proporcionado:
{context}

Pregunta del usuario: {question}

Si la información del contexto es relevante y suficiente, proporciona una respuesta clara y concisa.
Si el contexto no contiene información relevante para responder la pregunta, di claramente: "No tengo suficiente información en mi base de conocimiento para responder a esta pregunta de manera precisa."

Respuesta:`);

            const chain = RunnableSequence.from([
                {
                    context: retriever.pipe(docs => {
                        const context = docs.map(doc =>
                            `Fuente: ${doc.metadata.title || 'N/A'}\nContenido: ${doc.pageContent}`
                        ).join("\n\n---\n\n");
                        return context;
                    }),
                    question: new RunnablePassthrough(),
                },
                prompt,
                this.ollamaLLM,
                new StringOutputParser(),
            ]);

            const result = await chain.invoke(question);

            // Obtener los documentos recuperados para las fuentes
            const relevantDocs = await retriever.getRelevantDocuments(question);
            const sources = relevantDocs.map(doc => ({
                title: doc.metadata.title,
                slug: doc.metadata.slug,
                source: doc.metadata.source,
                content: doc.pageContent.substring(0, 200) + '...' // Vista previa
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

    // Método de utilidad adicional para verificar el estado del sistema
    async getSystemStatus(): Promise<{
        database: string;
        ollama: string;
        embeddingModel: string;
        llmModel: string;
    }> {
        try {
            // Probar la conexión a la base de datos
            const dbStatus = await this.client.db().admin().ping();

            // Probar la conexión a Ollama
            const ollamaResponse = await fetch('http://localhost:11434/api/tags');
            const ollamaStatus = ollamaResponse.ok ? 'connected' : 'disconnected';

            return {
                database: dbStatus ? 'connected' : 'disconnected',
                ollama: ollamaStatus,
                embeddingModel: this.ollamaEmbeddingModel,
                llmModel: this.ollamaGenerationModel
            };
        } catch (error) {
            return {
                database: 'error',
                ollama: 'error',
                embeddingModel: this.ollamaEmbeddingModel,
                llmModel: this.ollamaGenerationModel
            };
        }
    }
}