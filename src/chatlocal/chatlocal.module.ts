import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatlocalService } from './chatlocal.service';
import { ChatlocalController } from './chatlocal.controller';

@Module({
  imports: [HttpModule],
  controllers: [ChatlocalController],
  providers: [ChatlocalService],
  exports: [ChatlocalService],
})
export class ChatlocalModule {}
