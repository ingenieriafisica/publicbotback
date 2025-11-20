import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = new DocumentBuilder()
    .setTitle('publicbot')
    .setDescription('backend del chatbot público para responder sobre los servicios del Sena en cuanto a certificación de competencias laborales')
    .setVersion('1.0')
    .addTag('publicbot-backend')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  app.enableCors();
  await app.listen(3222);
}
bootstrap();
