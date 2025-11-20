import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsBoolean, IsEmail, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Número de identificación único del usuario.',
    example: 1028745632,
    minimum: 1, // Ejemplo de validación mínima si aplica
  })
  @IsNumber({}, { message: 'La identificación debe ser un número.' })
  identificacion: number;

  @ApiProperty({
    description: 'Nombre del usuario.',
    example: 'Juan',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  @MaxLength(50, { message: 'El nombre no debe exceder los 50 caracteres.' })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario.',
    example: 'Pérez',
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto.' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres.' })
  @MaxLength(50, { message: 'El apellido no debe exceder los 50 caracteres.' })
  apellido: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario (debe ser de dominio @sena.edu.co).',
    example: 'jperez@sena.edu.co',
  })
  @IsEmail({}, { message: 'El correo debe ser una dirección de email válida.' })
  @Matches(/^\S+@sena\.edu\.co$/, { message: 'El correo debe ser de dominio @sena.edu.co.' })
  @MaxLength(100, { message: 'El correo no debe exceder los 100 caracteres.' })
  correo_sena: string;

  @ApiProperty({
    description: 'Número de celular del usuario.',
    example: '3001234567',
    pattern: '^\\d{10}$', // Ejemplo de patrón para 10 dígitos
  })
  @IsString({ message: 'El número de celular debe ser una cadena de texto.' })
  @Matches(/^\d{10}$/, { message: 'El número de celular debe tener 10 dígitos.' })
  numero_celular: string;

  @ApiProperty({
    description: 'Rol asignado al usuario (ej. "Aprendiz", "Instructor", "Administrador").',
    example: 'Aprendiz',
  })
  @IsString({ message: 'El rol asignado debe ser una cadena de texto.' })
  rol_asignado: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres).',
    example: 'MiContraseñaSegura123',
    format: 'password', // Indica a Swagger que es un campo de contraseña
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password: string;

  // Aunque 'estado_actual' tiene un valor por defecto en el esquema, podrías querer permitir
  // que sea opcionalmente enviado en el DTO, si la lógica lo permite sobrescribir.
  // Si siempre se maneja por defecto en el backend, puedes omitirlo del DTO de creación.
  @ApiProperty({
    description: 'Estado actual del usuario (activo o inactivo). Por defecto es verdadero.',
    example: true,
    required: false, // Indica que es opcional para el DTO de creación
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado actual debe ser un valor booleano.' })
  estado_actual?: boolean;
}