import { PartialType } from '@nestjs/swagger';
import { CreateVectorstorelocalDto } from './create-vectorstorelocal.dto';

export class UpdateVectorstorelocalDto extends PartialType(CreateVectorstorelocalDto) {}
