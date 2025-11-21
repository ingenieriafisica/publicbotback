import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WhatsappapiService } from './whatsappapi.service';
import { WhatsappapiController } from './whatsappapi.controller';

@Module({
  imports: [HttpModule],
  controllers: [WhatsappapiController],
  providers: [WhatsappapiService],
})
export class WhatsappapiModule {}
