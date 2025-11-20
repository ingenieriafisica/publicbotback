import { IsNotEmpty, IsString, IsNumber, IsEmail, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  nombre_completo: string;

  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'juan.perez@example.com' })
  @IsEmail()
  @IsNotEmpty()
  correo_electronico: string;

  @ApiProperty({ description: 'Tipo de solicitud (PQR)', example: 'Petición' })
  @IsString()
  @IsNotEmpty()
  tipo_solicitud: string;

  @ApiProperty({
    description: 'Mensaje de la solicitud PQRS',
    example: 'Necesito ayuda sobre el proceso de certificación.',
  })
  @IsString()
  @IsNotEmpty()
  mensaje_pqrs: string;

  @ApiPropertyOptional({
    description: 'Calificación dada (1 a 5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  calificacion_dada: number;
}