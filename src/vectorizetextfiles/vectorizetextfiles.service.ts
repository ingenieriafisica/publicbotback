import { Injectable, Inject } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { Model } from 'mongoose';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Vectorlocal } from 'src/vectorstorelocal/entities/vectorlocal.schema';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class VectorizetextfilesService {

  constructor(@Inject('VECTORIZE_TEXT_FILES_MODEL') private vectorModel: Model<Vectorlocal>) {}


  async nomicEmbedTexts(texts: string[]): Promise<number[][]> {
    const url = process.env.OLLAMA_EMBEDDINGS_BASE_URL;
    
    const payload = {
      model: 'qwen3-embedding', 
      prompt: texts.join(' '),
      stream: false,
    };

    try {
      const res = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const embedding = res.data.embedding;
      if (!embedding || !Array.isArray(embedding)) {
        throw new Error('Respuesta inesperada de la API LLM: No se encontró el embedding.');
      }
      return [embedding];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response ? JSON.stringify(axiosError.response.data) : axiosError.message;
        throw new Error(`Error de la API LLM con Axios: ${axiosError.response?.status || 'N/A'} - ${errorMessage}`);
      } else {
        throw new Error(`Vectorización Error: ${error.message}`);
      }
    }
  }

  async uploadAndProcessTextFile(file: Express.Multer.File): Promise<string[]> {
    try {
      if (!file) {
        throw new Error('No se subió ningún archivo.');
      }

      const resolvedPath = path.resolve(file.path);

      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Archivo no encontrado: ${resolvedPath}`);
      }

      if (path.extname(file.originalname) !== '.txt') {
        fs.unlinkSync(resolvedPath);
        throw new Error('Solamente archivos .txt son admitidos.');
      }

      const loader = new TextLoader(resolvedPath);
      const docs = await loader.load();

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100,
      });
      const documents = await splitter.splitDocuments(docs);

      const texts = documents.map(doc => doc.pageContent);

      const allEmbeddings: number[][] = [];
      
      const batchSize = 30;
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const embeds = await Promise.all(batch.map(text => this.nomicEmbedTexts([text])));
        embeds.forEach(e => allEmbeddings.push(...e));
      }

      const ids: string[] = [];
      for (let i = 0; i < texts.length; i++) {
        const docContent = texts[i];
        const embedding = allEmbeddings[i];
        const savedDocument = await this.vectorModel.create({
          document: docContent,
          embedding,
        });
        ids.push(savedDocument.id);
      }

      fs.unlinkSync(resolvedPath);
      return ids;
    } catch (error) {
      console.error('Error procesando el archivo de texto:', error.message);
      throw new Error(`Error cargando y procesando el archivo de texto: ${error.message}`);
    }
  }
}