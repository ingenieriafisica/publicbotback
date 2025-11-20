import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Importar decorador de Swagger

export class LoginAuthDto {
  
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  correo_sena: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'mypassword123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}