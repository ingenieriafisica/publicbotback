import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticación no proporcionado.');
    }

    try {
      // Accede directamente a process.env.JWT_SECRET
      const secret = process.env.JWT_SECRET;

      // Asegúrate de que la variable de entorno esté definida
      if (!secret) {
        throw new Error('La clave secreta JWT (JWT_SECRET) no está definida en las variables de entorno.');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });

      // Asignamos el payload al objeto de solicitud.
      request['user'] = payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('El token ha expirado.');
      }
      // Si el error es debido a la falta de JWT_SECRET
      if (error instanceof Error && error.message.includes('JWT_SECRET')) {
         throw new UnauthorizedException(error.message); // Lanza el error de configuración
      }
      throw new UnauthorizedException('Token inválido o malformado.');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
