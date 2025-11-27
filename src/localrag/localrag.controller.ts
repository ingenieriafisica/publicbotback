import { Controller, Post, Get, Body, Param, Query, HttpException, HttpStatus, Logger, Delete } from '@nestjs/common';
import { LocalragService } from './localrag.service';

@Controller('localrag')
export class LocalragController {
    private readonly logger = new Logger(LocalragController.name);

    constructor(private readonly localragService: LocalragService) { }

    @Post('index/file')
    async indexFile(@Body() body: { filePath: string }) {
        try {
            const { filePath } = body;

            if (!filePath || filePath.trim().length === 0) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'La ruta del archivo es obligatoria'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            this.logger.log(`Solicitud de indexación recibida para: ${filePath}`);
            const result = await this.localragService.indexArticle(filePath);

            return {
                success: true,
                data: result,
                message: 'Documento indexado con éxito'
            };
        } catch (error) {
            this.logger.error(`Error de indexación: ${error.message}`);
            throw new HttpException(
                {
                    success: false,
                    message: `La indexación falló: ${error.message}`
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('index/directory')
    async indexDirectory(@Body() body: { directoryPath: string }) {
        try {
            const { directoryPath } = body;

            if (!directoryPath || directoryPath.trim().length === 0) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'La ruta del directorio es obligatoria'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            this.logger.log(`Solicitud de indexación de directorio recibida para: ${directoryPath}`);
            // Nota: Necesitarías agregar un método indexDirectory al servicio
            // const result = await this.localragService.indexDirectory(directoryPath);

            return {
                success: true,
                data: { directoryPath },
                message: 'Indexación de directorio procesada (función en desarrollo)'
            };
        } catch (error) {
            this.logger.error(`Error de indexación de directorio: ${error.message}`);
            throw new HttpException(
                {
                    success: false,
                    message: `La indexación del directorio falló: ${error.message}`
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
                        message: 'La pregunta es obligatoria'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            this.logger.log(`Consulta RAG recibida: ${question}`);
            const result = await this.localragService.ragSearch(question);

            return {
                success: true,
                data: result,
                message: 'Consulta procesada con éxito'
            };
        } catch (error) {
            this.logger.error(`Error de consulta: ${error.message}`);
            throw new HttpException(
                {
                    success: false,
                    message: `La consulta falló: ${error.message}`
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('search')
    async searchVectors(@Query('q') query: string, @Query('limit') limit: number = 5) {
        try {
            if (!query || query.trim().length === 0) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'El parámetro de búsqueda (q) es obligatorio'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            this.logger.log(`Búsqueda vectorial recibida: ${query}`);
            const result = await this.localragService.ragSearch(query);

            return {
                success: true,
                data: result,
                message: 'Búsqueda vectorial procesada con éxito'
            };
        } catch (error) {
            this.logger.error(`Error en búsqueda vectorial: ${error.message}`);
            throw new HttpException(
                {
                    success: false,
                    message: `La búsqueda vectorial falló: ${error.message}`
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('status')
    async getSystemStatus() {
        try {
            this.logger.log('Solicitud de estado del sistema recibida');
            const status = await this.localragService.getSystemStatus();

            return {
                success: true,
                data: status,
                message: 'Estado del sistema recuperado con éxito'
            };
        } catch (error) {
            this.logger.error(`Error de comprobación de estado: ${error.message}`);
            throw new HttpException(
                {
                    success: false,
                    message: `La comprobación de estado falló: ${error.message}`
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Delete('cleanup')
    async cleanupVectors() {
        try {
            this.logger.log('Solicitud de limpieza de vectores recibida');
            const result = await this.localragService.cleanupVectors();

            return {
                success: true,
                data: result,
                message: 'Limpieza de vectores completada con éxito'
            };
        } catch (error) {
            this.logger.error(`Error en limpieza de vectores: ${error.message}`);
            throw new HttpException(
                {
                    success: false,
                    message: `La limpieza de vectores falló: ${error.message}`
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('health')
    async healthCheck() {
        try {
            // Verificación básica de salud que incluye estado del sistema
            const status = await this.localragService.getSystemStatus();

            const isHealthy = status.database === 'connected' &&
                status.ollamaConnection === 'connected';

            return {
                success: true,
                data: {
                    service: 'active',
                    timestamp: new Date().toISOString(),
                    healthy: isHealthy,
                    components: {
                        database: status.database,
                        ollama: status.ollamaConnection,
                        embeddingModel: status.embeddingModel,
                        llmModel: status.llmModel
                    }
                },
                message: isHealthy ?
                    'El servicio RAG está en funcionamiento y saludable' :
                    'El servicio RAG está en funcionamiento pero con advertencias'
            };
        } catch (error) {
            this.logger.error(`Error en health check: ${error.message}`);
            return {
                success: false,
                data: {
                    service: 'degraded',
                    timestamp: new Date().toISOString(),
                    healthy: false,
                    error: error.message
                },
                message: 'El servicio RAG está experimentando problemas'
            };
        }
    }

    @Get('stats')
    async getStats() {
        try {
            this.logger.log('Solicitud de estadísticas recibida');

            // Obtener el estado del sistema que incluye información útil
            const status = await this.localragService.getSystemStatus();

            // Aquí podrías agregar más estadísticas como:
            // - Número total de documentos indexados
            // - Número total de chunks
            // - Tamaño de la base de datos vectorial
            // - Etc.

            const stats = {
                system: status,
                summary: {
                    embeddingDimension: status.embeddingDimension,
                    models: {
                        embedding: status.embeddingModel,
                        generation: status.llmModel
                    },
                    connections: {
                        database: status.database,
                        ollama: status.ollamaConnection
                    }
                },
                timestamp: new Date().toISOString()
            };

            return {
                success: true,
                data: stats,
                message: 'Estadísticas recuperadas con éxito'
            };
        } catch (error) {
            this.logger.error(`Error obteniendo estadísticas: ${error.message}`);
            throw new HttpException(
                {
                    success: false,
                    message: `Error obteniendo estadísticas: ${error.message}`
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}