import { Module } from '@nestjs/common';
import { LocalragService } from './localrag.service';
import { LocalragController } from './localrag.controller';
import { DatabaseModule } from 'src/database/database.module';
import { localragProviders } from './localrag.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [LocalragController],
  providers: [LocalragService, ...localragProviders],
})
export class LocalragModule {}
