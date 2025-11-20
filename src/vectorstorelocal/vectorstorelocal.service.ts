import { Injectable, HttpException, HttpStatus, Logger, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { Vectorlocal } from './entities/vectorlocal.schema';
import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class VectorstorelocalService {
  private collection: any;
  private client: MongoClient;
  private vectorStore: MongoDBAtlasVectorSearch;
  private readonly logger = new Logger(VectorstorelocalService.name);
  private axiosInstance: AxiosInstance;
  private baseUrl: string;

  constructor(@Inject('VECTOR_LOCAL_MODEL') private vectorModel: Model<Vectorlocal>) {
    this.client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
    this.collection = this.client
      .db(process.env.MONGODB_ATLAS_DB_NAME)
      .collection(process.env.MONGODB_ATLAS_LOCAL_COLLECTION_NAME);

    this.vectorStore = new MongoDBAtlasVectorSearch(undefined, {
      collection: this.collection,
      indexName: "default",
      textKey: "document",
      embeddingKey: "embedding",
    });

    this.baseUrl = 'http://127.0.0.1:11434/api/embeddings';
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.connectToDB();
  }

  private async connectToDB() {
    try {
      await this.client.connect();
      this.logger.log('Conectado con M  ongoDB Atlas');

      this.collection = this.client
        .db(process.env.MONGODB_ATLAS_DB_NAME)
        .collection(process.env.MONGODB_ATLAS_LOCAL_COLLECTION_NAME);

      this.vectorStore = new MongoDBAtlasVectorSearch(undefined, {
        collection: this.collection,
        indexName: "default",
        textKey: "document",
        embeddingKey: "embedding",
      });
    } catch (error) {
      this.logger.error(`Error al tratar de conectarse con MongoDB Atlas: ${error.message}`);
    }
  }

  private async embedDocuments(texts: string[]): Promise<number[][]> {
    try {
      const promises = texts.map(async (text) => {
        const response = await this.axiosInstance.post(this.baseUrl, {
          model: 'qwen3-embedding',
          prompt: text,
        });
        return response.data.embedding;
      });

      const embeddings = await Promise.all(promises);
      return embeddings;
    } catch (error) {
      throw new HttpException(
        `Falló la vectorización de documentos: ${error.response?.data?.message || error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addDocument(documentData: any): Promise<void> {
    try {
      const text = documentData.document;
      if (!text) {
        this.logger.error('No se encontró el campo "document" en el data recibido.');
        return;
      }
      const [embedding] = await this.embedDocuments([text]);
      const dataWithEmbedding = {
        ...documentData,
        embedding,
      };
      await this.vectorModel.create(dataWithEmbedding);
      this.logger.log('Documento y embedding agregados a MongoDB');
    } catch (error) {
      this.logger.error('Error agregando documento a MongoDB:', error);
    }
  }
  
  async findAll(): Promise<Vectorlocal[]> {
    try {
      return await this.vectorModel.find().exec();
    } catch (error) {
      this.logger.error('Error al tratar de leer los documentos en MongoDB:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Vectorlocal> {
    try {
      return await this.vectorModel.findById(id).exec();
    } catch (error) {
      this.logger.error(`Error al buscar el documento con ID ${id}:`, error);
      throw error;
    }
  }
  
  async updateDocument(id: string, updateData: any): Promise<Vectorlocal> {
    try {
      const text = updateData.document;
      if (text) {
        const [embedding] = await this.embedDocuments([text]);
        updateData.embedding = embedding;
      }
      return await this.vectorModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    } catch (error) {
      this.logger.error(`Error al actualizar el documento con ID ${id}:`, error);
      throw error;
    }
  }
  
  async deleteDocument(id: string): Promise<Vectorlocal> {
    try {
      return await this.vectorModel.findByIdAndDelete(id).exec();
    } catch (error) {
      this.logger.error(`Error al eliminar el documento con ID ${id}:`, error);
      throw error;
    }
  }

  async findRelevantDocuments(question: string) {
    try {
      const similaritySearchResults = await this.vectorStore.similaritySearch(question, 10);
      for (const doc of similaritySearchResults) {
        this.logger.log(`* ${doc.pageContent} [Metadata: ${JSON.stringify(doc.metadata, null, 2)}]`);
      }
    } catch (error) {
      this.logger.error(`Error en la búsqueda por similaridad: ${error.message}`);
    }
  }
}