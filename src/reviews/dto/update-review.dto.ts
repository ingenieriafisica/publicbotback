import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}