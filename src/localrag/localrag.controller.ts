import { Controller, Post, Get, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { LocalragService } from './localrag.service';

@Controller('localrag')
export class LocalragController {
    private readonly logger = new Logger(LocalragController.name);

    constructor(private readonly localragService: LocalragService) { }

    @Post('index/:filePath')
    async indexArticle(@Param('filePath') filePath: string) {
        try {
            // Solicitud de indexación recibida
            this.logger.log(`Solicitud de indexación recibida para: ${filePath}`);
            const result = await this.localragService.indexArticle(filePath);
            return {
                success: true,
                data: result,
                // Mensaje de éxito de indexación
                message: 'Documento indexado con éxito'
            };
        } catch (error) {
            // Error de indexación
            this.logger.error(`Error de indexación: ${error.message}`);
            throw new HttpException(
                {
                    success: false,
                    // Mensaje de fallo de indexación
                    message: `La indexación falló: ${error.message}`
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('query')
    async queryRAG(@Body() body: { question: string }) {
        try {
            const { question } = body;

            if (!question || question.trim().length === 0) {
                throw new HttpException(
                    {
                        success: false,
                        // Mensaje de error: pregunta requerida
                        message: 'La pregunta es obligatoria'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Consulta RAG recibida
            this.logger.log(`Consulta RAG recibida: ${question}`);
            const result = await this.localragService.ragSearch(question);

            return {
                success: true,
                data: result,
                // Mensaje de éxito de la consulta
                message: 'Consulta procesada con éxito'
            };
        } catch (error) {
            // Error de consulta
            this.logger.error(`Error de consulta: ${error.message}`);
            throw new HttpException(
                {
                    success: false,
                    // Mensaje de fallo de la consulta
                    message: `La consulta falló: ${error.message}`
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('status')
    async getSystemStatus() {
        try {
            const status = await this.localragService.getSystemStatus();
            return {
                success: true,
                data: status,
                // Mensaje de éxito de obtención de estado
                message: 'Estado del sistema recuperado con éxito'
            };
        } catch (error) {
            // Error de comprobación de estado
            this.logger.error(`Error de comprobación de estado: ${error.message}`);
            throw new HttpException(
                {
                    success: false,
                    // Mensaje de fallo de comprobación de estado
                    message: `La comprobación de estado falló: ${error.message}`
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('health')
    async healthCheck() {
        return {
            success: true,
            // Mensaje de servicio activo
            message: 'El servicio RAG está en funcionamiento',
            timestamp: new Date().toISOString()
        };
    }
}