import { PartialType } from '@nestjs/swagger';
import { CreateVectorizetextDto } from './create-vectorizetext.dto';

export class UpdateVectorizetextDto extends PartialType(CreateVectorizetextDto) {}
