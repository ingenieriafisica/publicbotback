import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SendTextMessageDto } from './dto/send-text-message.dto';
import { SendTemplateMessageDto } from './dto/send-template-message.dto';

// 💡 Inclusión explícita de dotenv y llamada a config()
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class WhatsappapiService {
  private readonly logger = new Logger(WhatsappapiService.name);

  // Variables de configuración de solo lectura
  private readonly phoneNumberId: string;
  private readonly verifyToken: string;
  private readonly accessToken: string;
  private readonly baseUrl: string;
  private readonly apiVersion: string;

  constructor(
    private readonly httpService: HttpService,
    // ❌ Eliminamos la inyección de ConfigService, ya que usamos process.env
  ) {
    // 2. Asignamos los valores directamente desde process.env
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.baseUrl = process.env.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com';
    // Usamos el valor del .env (v22.0) o un valor por defecto
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0'; 

    // Validación básica (opcional pero recomendada)
    if (!this.phoneNumberId || !this.accessToken) {
      this.logger.warn('Faltan variables de entorno críticas (WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN)');
    }
  }

  // --- Helper para Headers y URL ---
  private getRequestConfig() {
    return {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
  }

  // 💡 FIX: Aseguramos la correcta construcción de la URL (la corrección del '/' se mantiene)
  private getFullUrl(): string {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    return `${base}/${this.apiVersion}/${this.phoneNumberId}/messages`;
  }

  // --- Enviar Mensajes ---

  async sendTextMessage(dto: SendTextMessageDto): Promise<any> {
    const url = this.getFullUrl();
    const payload = {
      messaging_product: 'whatsapp',
      to: dto.to,
      type: 'text',
      text: { body: dto.message },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, this.getRequestConfig())
      );
      
      this.logger.log(`Mensaje de texto enviado a ${dto.to}. ID: ${response.data.messages[0].id}`);
      return response.data;
    } catch (error) {
      this.handleWhatsappApiError(error, 'enviar mensaje de texto');
    }
  }

  async sendTemplateMessage(dto: SendTemplateMessageDto): Promise<any> {
    const url = this.getFullUrl();
    const payload = {
      messaging_product: 'whatsapp',
      to: dto.to,
      type: 'template',
      template: {
        name: dto.templateName,
        language: { code: dto.languageCode },
        // 💡 Ajuste: Incluimos components solo si existen en el DTO
        ...(dto.components && { components: dto.components }),
      },
    };

    try {
      // Esta llamada corresponde exactamente al curl que deseas enviar
      const response = await firstValueFrom(
        this.httpService.post(url, payload, this.getRequestConfig())
      );
      
      this.logger.log(`Plantilla enviada a ${dto.to}.`);
      return response.data;
    } catch (error) {
      this.handleWhatsappApiError(error, 'enviar plantilla');
    }
  }

  // --- Webhooks ---

  verifyWebhook(mode: string, token: string, challenge: string): string {
    if (mode === 'subscribe' && token === this.verifyToken) {
      this.logger.log('Webhook verificado exitosamente!');
      return challenge;
    }
    throw new HttpException('Failed verification', HttpStatus.FORBIDDEN);
  }

  handleWebhook(payload: any): void {
    if (payload.object === 'whatsapp_business_account') {
      payload.entry?.forEach(entry => {
        entry.changes?.forEach(change => {
          if (change.field === 'messages') {
            const messages = change.value.messages || [];
            messages.forEach(msg => {
              if (msg.type === 'text') {
                this.logger.log(`Mensaje recibido de ${msg.from}: ${msg.text.body}`);
              }
            });
          }
        });
      });
    }
  }

  private handleWhatsappApiError(error: any, context: string): void {
    this.logger.error(`Error al ${context}: ${error.message}`);
    if (error.response) {
        this.logger.error(JSON.stringify(error.response.data)); 
    }
    throw new HttpException(error.response?.data || 'Error WhatsApp API', error.response?.status || 500);
  }
}