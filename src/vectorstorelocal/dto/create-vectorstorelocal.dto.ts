import { IsString, IsArray, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateVectorstorelocalDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsArray({ message: 'Embedding must be an array' })
  @IsNumber({}, { each: true, message: 'Each embedding element must be a number' })
  embedding: number[];

  @IsString()
  document: string;
}
