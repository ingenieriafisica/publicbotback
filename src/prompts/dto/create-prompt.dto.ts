import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromptDto {

  @ApiProperty({
    description: 'La pregunta o el mensaje del usuario para el chatbot.',
    example: '¿Qué es la IA?',
  })
  @IsNotEmpty({ message: 'El campo `userPrompt` no puede estar vacío.' })
  @IsString({ message: 'El campo `userPrompt` debe ser una cadena de caracteres.' })
  userPrompt: string;

    @ApiProperty({
    description: 'Respuesta del chatbot',
    example: 'Es un software especializado para calcular probabilidades y hacer creer a la gente que es inteligente.',
  })
  @IsNotEmpty({ message: 'El campo `chatbotResponse` lo regresa el bot' })
  @IsString({ message: 'El campo `userPrompt` debe ser una cadena de caracteres.' })
  chatbotResponse: string;
  
}