import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SendPromptDto } from './send.prompt.dto';
import { OllamaResponseDto } from './ollama.response.dto';
import axios from 'axios';

@Injectable()
export class ChatlocalService {
  private readonly ollamaBaseUrl = 'http://localhost:11434';
  private readonly defaultModel = 'mistral';

  async sendPrompt(sendPromptDto: SendPromptDto): Promise<OllamaResponseDto> {
    const { prompt, model, temperature, max_tokens } = sendPromptDto;

    try {
      const response = await axios.post(
        `${this.ollamaBaseUrl}/api/generate`,
        {
          model: model || this.defaultModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: temperature || 0.1,
            num_predict: max_tokens || 130000,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 180000, // 3 minutos de espera
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new HttpException(
            'el servidor de modelos no está corriendo. por favor reinicie el servicio en el puerto localhost:11434',
            HttpStatus.SERVICE_UNAVAILABLE
          );
        }
        
        throw new HttpException(
          `Error en la API LLM: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      throw new HttpException(
        'Ocurrió un Error inesperado',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAvailableModels(): Promise<any> {
    try {
      const response = await axios.get(`${this.ollamaBaseUrl}/api/tags`);
      return response.data;
    } catch (error) {
      throw new HttpException(
        'No se pudieron obtener los modelos disponibles',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getModelInfo(modelName: string = this.defaultModel): Promise<any> {
    try {
      const response = await axios.post(`${this.ollamaBaseUrl}/api/show`, {
        name: modelName,
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        `No se pudo obtener información del modelo: ${modelName}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}