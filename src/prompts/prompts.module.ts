import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from 'src/database/database.module';
import { PromptsService } from './prompts.service';
import { PromptsController } from './prompts.controller';
import { promptsProviders } from './prompts.providers';

@Module({
  imports: [DatabaseModule, MongooseModule],
  controllers: [PromptsController],
  providers: [PromptsService, ...promptsProviders],
  exports: [PromptsService, ...promptsProviders]
})
export class PromptsModule {}
