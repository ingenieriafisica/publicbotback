import { Controller, Post, Get, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ChatlocalService } from './chatlocal.service';
import { SendPromptDto } from './send.prompt.dto';
import { OllamaResponseDto } from './ollama.response.dto';

@Controller('local')
export class ChatlocalController {
  constructor(private readonly chatlocalService: ChatlocalService) {}

  @Post()
  async sendPrompt(@Body() sendPromptDto: SendPromptDto): Promise<OllamaResponseDto> {
    try {
      return await this.chatlocalService.sendPrompt(sendPromptDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('models')
  async getAvailableModels(): Promise<any> {
    try {
      return await this.chatlocalService.getAvailableModels();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('model/:modelName?')
  async getModelInfo(@Param('modelName') modelName?: string): Promise<any> {
    try {
      return await this.chatlocalService.getModelInfo(modelName);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      await this.chatlocalService.getAvailableModels();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        'Ollama service is unreachable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
}