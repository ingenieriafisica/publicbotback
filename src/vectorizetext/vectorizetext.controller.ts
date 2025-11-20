import { Controller, Post, UploadedFile, UseInterceptors, HttpCode, HttpStatus, Logger, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VectorizetextService } from './vectorizetext.service';

@Controller('upload')
export class VectorizetextController {
  private readonly logger = new Logger(VectorizetextController.name);

  constructor(private readonly uploadtextService: VectorizetextService ) {}

  @Post('text')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(txt)$/)) {
        req.fileValidationError = 'Solamente archivos de texto .txt son permitidos.';
        return callback(null, false);
      }
      callback(null, true);
    },
  }))
  @HttpCode(HttpStatus.CREATED)
  async uploadTextFile(@UploadedFile() file: Express.Multer.File): Promise<string[]> {
    try {
      if (!file) {
        throw new BadRequestException('No se ha proporcionado un archivo o el archivo no es un .txt válido.');
      }

      this.logger.log(`Archivo recibido: ${file.originalname}`);
      const documentIds = await this.uploadtextService.uploadAndProcessTextFile(file);

      this.logger.log(`Procesamiento completado para el archivo: ${file.originalname}`);
      return documentIds;
    } catch (error) {
      this.logger.error(`Error procesando el archivo: ${error.message}`);
      throw error;
    }
  }
}

