import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor( private usersService: UsersService, private jwtService: JwtService ) { }

  async login(loginDto: LoginAuthDto) {
    const user = await this.usersService.findByEmail(loginDto.correo_sena);

    if (!user) {
      throw new NotFoundException('No se encontró el usuario');
    }

    const isPasswordMatching = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Credenciales no válidas');
    }

    const payload = { email: user.correo_sena, role: user.rol_asignado };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

}
