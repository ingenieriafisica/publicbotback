import { Controller, Post, UploadedFile, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VectorizetextfilesService } from './vectorizetextfiles.service';

@Controller('embedd')
export class VectorizetextfilesController {
  constructor(private readonly uploadtextService: VectorizetextfilesService) {}

  @Post('textfile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTextFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded.', HttpStatus.BAD_REQUEST);
      }

      const ids = await this.uploadtextService.uploadAndProcessTextFile(file);
      return { message: 'Archivo procesado exitosamente', ids };
    } catch (error) {
      console.error('Error de VectorizetextfilesController:', error.message);
      throw new HttpException(
        {
          message: error.message || 'Error procesando el archivo',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}