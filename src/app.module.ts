import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReviewsModule } from './reviews/reviews.module';
import { DatabaseModule } from './database/database.module';
import { PromptsModule } from './prompts/prompts.module';
import { AnswersModule } from './answers/answers.module';
import { UsersModule } from './users/users.module';
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './loggin.interceptor';
import { MetricsMiddleware } from './metrics/metrics.middleware';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { ChatlocalModule } from './chatlocal/chatlocal.module';
import { MulterModule } from '@nestjs/platform-express';
import { VectorstorelocalModule } from './vectorstorelocal/vectorstorelocal.module';
import { VectorizetextModule } from './vectorizetext/vectorizetext.module';
import { VectorizetextfilesModule } from './vectorizetextfiles/vectorizetextfiles.module';
import { LocalragModule } from './localrag/localrag.module';
import { WhatsappapiModule } from './whatsappapi/whatsappapi.module';

@Module({
  imports: [
    PrometheusModule.register(),
    ReviewsModule,
    MulterModule,
    DatabaseModule,
    PromptsModule,
    AnswersModule,
    UsersModule,
    AuthModule,
    HttpModule,
    ChatlocalModule,
    VectorstorelocalModule,
    VectorizetextModule,
    VectorizetextfilesModule,
    LocalragModule,
    WhatsappapiModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('users');
  }
}