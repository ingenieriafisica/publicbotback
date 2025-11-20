import { IsString, IsNotEmpty, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDto {

  @ApiProperty({ description: 'El rol del autor de la respuesta.' })
  @IsString()
  @IsNotEmpty()
  role: string;

 
  @ApiProperty({ description: 'El contenido de la respuesta' })
  @IsString()
  @IsNotEmpty()
  content: string;
}