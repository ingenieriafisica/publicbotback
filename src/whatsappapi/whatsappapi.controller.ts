import { Body, Controller, Get, Post, Query, Res, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { WhatsappapiService } from './whatsappapi.service';
import { SendTextMessageDto } from './dto/send-text-message.dto';
import { SendTemplateMessageDto } from './dto/send-template-message.dto';

@Controller('whatsapp')
export class WhatsappapiController {
  constructor(private readonly whatsappService: WhatsappapiService) {}

  @Post('send-text')
  async sendTextMessage(@Body() dto: SendTextMessageDto) {
    return this.whatsappService.sendTextMessage(dto);
  }

  @Post('send-template')
  async sendTemplateMessage(@Body() dto: SendTemplateMessageDto) {
    return this.whatsappService.sendTemplateMessage(dto);
  }

  // Endpoint de verificación para Meta
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    try {
      const result = this.whatsappService.verifyWebhook(mode, token, challenge);
      res.status(HttpStatus.OK).send(result);
    } catch (error) {
      res.status(HttpStatus.FORBIDDEN).send('Fallo verificación');
    }
  }

  // Endpoint para recibir mensajes
  @Post('webhook')
  handleWebhook(@Body() payload: any) {
    this.whatsappService.handleWebhook(payload);
    return 'EVENT_RECEIVED';
  }
}