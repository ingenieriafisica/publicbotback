import { PartialType } from '@nestjs/swagger';
import { CreateVectorizetextfileDto } from './create-vectorizetextfile.dto';

export class UpdateVectorizetextfileDto extends PartialType(CreateVectorizetextfileDto) {}
