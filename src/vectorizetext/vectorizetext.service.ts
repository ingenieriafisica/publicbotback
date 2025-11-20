import { Injectable, Inject, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import axios, { AxiosInstance } from 'axios';
import { Vectorlocal } from 'src/vectorstorelocal/entities/vectorlocal.schema';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { MongoClient, Collection } from 'mongodb';

dotenv.config();

@Injectable()
export class VectorizetextService {
  private readonly logger = new Logger(VectorizetextService.name);
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private client: MongoClient;
  private nomicVectorsCollection: Collection;

  constructor(@Inject('VECTORIZE_LOCAL_MODEL') private vectorModel: Model<Vectorlocal>) {
    this.baseUrl = process.env.OLLAMA_EMBEDDINGS_BASE_URL;
    if (!this.baseUrl) {
      this.logger.error('La variable de entorno OLLAMA_EMBEDDINGS_BASE_URL no está definida.');
      throw new Error('Configuración de URL base para embeddings faltante.');
    }

    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    const mongoUri = process.env.MONGODB_ATLAS_URI;
    const dbName = process.env.MONGODB_ATLAS_DB_NAME;
    const collectionName = process.env.MONGODB_ATLAS_LOCAL_VECTORS;

    if (!mongoUri || !dbName) {
      this.logger.error('Variables de entorno MONGODB_ATLAS_URI o MONGODB_ATLAS_DB_NAME no están definidas.');
      throw new Error('Configuración de conexión a MongoDB faltante.');
    }

    this.client = new MongoClient(mongoUri);
    this.connectToMongoDB(dbName, collectionName);
  }


  private async connectToMongoDB(dbName: string, collectionName: string): Promise<void> {
    try {
      await this.client.connect();
      this.logger.log('Conectado a MongoDB Atlas');
      this.nomicVectorsCollection = this.client.db(dbName).collection(collectionName);
      this.logger.log(`Usando colección: ${collectionName} para embeddings.`);
    } catch (error) {
      this.logger.error(`Error al conectar a MongoDB Atlas: ${error.message}`);
      throw new Error(`No se pudo conectar a la base de datos MongoDB: ${error.message}`);
    }
  }


  async uploadAndProcessTextFile(file: Express.Multer.File): Promise<string[]> {
    if (!file) {
      throw new HttpException('No se subió ningún archivo.', HttpStatus.BAD_REQUEST);
    }
    const resolvedPath = path.resolve(file.path);
    try {
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Archivo no encontrado: ${resolvedPath}`);
      }
      if (path.extname(file.originalname).toLowerCase() !== '.txt') {
        throw new HttpException('Solamente archivos .txt son admitidos.', HttpStatus.UNSUPPORTED_MEDIA_TYPE);
      }

      const loader = new TextLoader(resolvedPath);
      const docs = await loader.load();

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100,
      });
      const documents = await splitter.splitDocuments(docs);

      const ids: string[] = [];
      for (const doc of documents) {
        const embedding = await this.getEmbeddingFromApi(doc.pageContent);
        const result = await this.nomicVectorsCollection.insertOne({
          document: doc.pageContent,
          embedding: embedding,
          metadata: doc.metadata,
          originalFileName: file.originalname,
          uploadDate: new Date(),
        });
        ids.push(result.insertedId.toString());
      }

      this.logger.log(`Archivo ${file.originalname} procesado y embeddings guardados en 'nomicvectors'.`);
      return ids;
    } catch (error) {
      this.logger.error(`Error procesando el archivo de texto ${file.originalname}:`, error.message);
      if (fs.existsSync(resolvedPath)) {
        await fs.promises.unlink(resolvedPath).catch(err => {
          this.logger.error(`Error al eliminar el archivo temporal ${resolvedPath}: ${err.message}`);
        });
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error cargando y procesando el archivo de texto: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (fs.existsSync(resolvedPath)) {
        await fs.promises.unlink(resolvedPath).catch(err => {
          this.logger.error(`Error al eliminar el archivo temporal en finally ${resolvedPath}: ${err.message}`);
        });
      }
    }
  }


  private async getEmbeddingFromApi(text: string): Promise<number[]> {
    const MAX_RETRIES = 3;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const response = await this.axiosInstance.post(this.baseUrl, {
          model: 'qwen3-embedding',
          prompt: text,
        });
        if (response.data && Array.isArray(response.data.embedding)) {
          return response.data.embedding;
        } else {
          throw new Error('Respuesta inesperada de la API de embedding: formato de datos incorrecto.');
        }
      } catch (error) {
        retries++;
        this.logger.warn(`Intento ${retries}/${MAX_RETRIES} fallido al obtener embedding: ${error.message}`);

        if (retries < MAX_RETRIES) {
          const delay = Math.pow(2, retries) * 1000;
          this.logger.log(`Reintentando en ${delay / 1000} segundos...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          this.logger.error('Fallaron todos los reintentos al obtener el embedding.');
          throw new HttpException(
            `Falló el intento de obtener el vector de la API: ${error.response?.data?.message || error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    }
    throw new HttpException('No se pudo obtener el embedding después de varios reintentos.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
