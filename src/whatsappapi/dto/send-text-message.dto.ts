import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class SendTextMessageDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'El número debe tener formato internacional (e.g., +34612345678)' })
  to: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}