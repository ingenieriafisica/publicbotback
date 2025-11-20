import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { VectorizetextfilesService } from './vectorizetextfiles.service';
import { VectorizetextfilesController } from './vectorizetextfiles.controller';
import { vectorizetextfilesProviders } from './vectorizetextfiles.providers';

@Module({
  imports: [DatabaseModule, MongooseModule],
  controllers: [VectorizetextfilesController],
  providers: [VectorizetextfilesService, ...vectorizetextfilesProviders ],
})
export class VectorizetextfilesModule {}
