import { Module } from '@nestjs/common';
import { VectorstorelocalService } from './vectorstorelocal.service';
import { VectorstorelocalController } from './vectorstorelocal.controller';
import { vectorstorelocalProviders } from './vectorstorelocal.providers';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule, MongooseModule],
  controllers: [VectorstorelocalController],
  providers: [VectorstorelocalService, ...vectorstorelocalProviders],
  exports: [VectorstorelocalService, ...vectorstorelocalProviders]
})
export class VectorstorelocalModule {}
