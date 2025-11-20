import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { VectorizetextService } from './vectorizetext.service';
import { VectorizetextController } from './vectorizetext.controller';
import { vectorizetextProviders } from './vectorizetext.providers';

@Module({
  imports: [DatabaseModule, MongooseModule],
  controllers: [VectorizetextController],
  providers: [VectorizetextService, ...vectorizetextProviders],
})
export class VectorizetextModule {}
