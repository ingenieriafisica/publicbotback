import { PartialType } from '@nestjs/swagger';
import { CreateLocalragDto } from './create-localrag.dto';

export class UpdateLocalragDto extends PartialType(CreateLocalragDto) {}
