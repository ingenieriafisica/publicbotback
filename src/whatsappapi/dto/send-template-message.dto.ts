import { IsString, IsNotEmpty, Matches, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class TemplateComponentParameter {
  @IsString()
  @IsNotEmpty()
  type: string; // "text"

  @IsString()
  @IsNotEmpty()
  text: string;
}

class TemplateComponent {
  @IsString()
  @IsNotEmpty()
  type: string; // "body", "header", "button"

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateComponentParameter)
  parameters: TemplateComponentParameter[];
}

export class SendTemplateMessageDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Formato internacional requerido' })
  to: string;

  @IsString()
  @IsNotEmpty()
  templateName: string;

  @IsString()
  @IsNotEmpty()
  languageCode: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateComponent)
  components?: TemplateComponent[];
}