import { Body, Controller, Get, Post, Query, Logger } from '@nestjs/common';
import { WhatsappapiService } from './whatsappapi.service';
import { SendTextMessageDto } from './dto/send-text-message.dto';
import { SendTemplateMessageDto } from './dto/send-template-message.dto';

@Controller('whatsapp')
export class WhatsappapiController {
  private readonly logger = new Logger(WhatsappapiController.name);

  constructor(private readonly whatsappService: WhatsappapiService) { }

  @Post('send-text')
  async sendTextMessage(@Body() dto: SendTextMessageDto) {
    this.logger.log(`Recibida solicitud para enviar mensaje de texto a ${dto.to}`);
    // Llama al servicio, que maneja la lógica de la API
    return this.whatsappService.sendTextMessage(dto);
  }

  @Post('send-template')
  async sendTemplateMessage(@Body() dto: SendTemplateMessageDto) {
    this.logger.log(`Recibida solicitud para enviar plantilla '${dto.templateName}' a ${dto.to}`);
    // Llama al servicio, que maneja la lógica de la API
    return this.whatsappService.sendTemplateMessage(dto);
  }


  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): string {
    this.logger.log('Intento de verificación de Webhook recibido.');
    return this.whatsappService.verifyWebhook(mode, token, challenge);
  }

  @Post('webhook')
  handleWebhook(@Body() payload: any): string {
    this.logger.debug('Payload de Webhook recibido.', JSON.stringify(payload));
    this.whatsappService.handleWebhook(payload);
    return 'EVENT_RECEIVED';
  }
}