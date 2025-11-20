import { Module } from '@nestjs/common';
import { WhatsappapiService } from './whatsappapi.service';
import { WhatsappapiController } from './whatsappapi.controller';

@Module({
  controllers: [WhatsappapiController],
  providers: [WhatsappapiService],
})
export class WhatsappapiModule {}
