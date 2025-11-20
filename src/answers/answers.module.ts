import { Module } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';
import { answersProviders } from './answers.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AnswersController],
  providers: [AnswersService, ...answersProviders]
})
export class AnswersModule {}
