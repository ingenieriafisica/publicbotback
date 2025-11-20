import { Controller, Post, Get, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { VectorstorelocalService } from './vectorstorelocal.service';
import { Vectorlocal } from './entities/vectorlocal.schema';
import { CreateVectorstorelocalDto } from './dto/create-vectorstorelocal.dto';

@Controller('localvectors')
export class VectorstorelocalController {
  private readonly logger = new Logger(VectorstorelocalController.name);

  constructor(private readonly vectorstorelocalService: VectorstorelocalService) {}

  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  async addDocument(@Body() createDto: CreateVectorstorelocalDto): Promise<any> {
    if (!createDto.document) {
      this.logger.error('El campo "document" es requerido para añadir un documento.');
      throw new BadRequestException('El campo "document" es requerido.');
    }
    try {
      this.logger.log('Recibida solicitud para agregar documento.');
      return await this.vectorstorelocalService.addDocument(createDto);
    } catch (error) {
      this.logger.error(`Error al agregar documento: ${error.message}`);
      throw error;
    }
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAllDocuments(): Promise<Vectorlocal[]> {
    try {
      this.logger.log('Recibida solicitud para obtener todos los documentos.');
      return await this.vectorstorelocalService.findAll();
    } catch (error) {
      this.logger.error(`Error al obtener todos los documentos: ${error.message}`);
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getDocumentById(@Param('id') id: string): Promise<Vectorlocal> {
    try {
      this.logger.log(`Recibida solicitud para obtener el documento con ID: ${id}`);
      const document = await this.vectorstorelocalService.findOne(id);
      if (!document) {
        throw new NotFoundException('Documento no encontrado');
      }
      return document;
    } catch (error) {
      this.logger.error(`Error al obtener el documento con ID ${id}: ${error.message}`);
      throw error;
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateDocument(@Param('id') id: string, @Body() updateDto: Partial<CreateVectorstorelocalDto>): Promise<Vectorlocal> {
    try {
      this.logger.log(`Recibida solicitud para actualizar el documento con ID: ${id}`);
      const updatedDocument = await this.vectorstorelocalService.updateDocument(id, updateDto);
      if (!updatedDocument) {
        throw new NotFoundException('Documento no encontrado');
      }
      return updatedDocument;
    } catch (error) {
      this.logger.error(`Error al actualizar el documento con ID ${id}: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDocument(@Param('id') id: string): Promise<void> {
    try {
      this.logger.log(`Recibida solicitud para eliminar el documento con ID: ${id}`);
      const deletedDocument = await this.vectorstorelocalService.deleteDocument(id);
      if (!deletedDocument) {
        throw new NotFoundException('Documento no encontrado');
      }
    } catch (error) {
      this.logger.error(`Error al eliminar el documento con ID ${id}: ${error.message}`);
      throw error;
    }
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchRelevantDocuments(@Query('question') question: string): Promise<any> {
    if (!question) {
      this.logger.warn('El parámetro de consulta "question" es requerido para la búsqueda.');
      throw new BadRequestException('El parámetro de consulta "question" es requerido.');
    }
    try {
      this.logger.log(`Recibida solicitud de búsqueda por similitud para la pregunta: "${question}"`);
      return await this.vectorstorelocalService.findRelevantDocuments(question);
    } catch (error) {
      this.logger.error(`Error en la búsqueda de documentos relevantes: ${error.message}`);
      throw error;
    }
  }
}