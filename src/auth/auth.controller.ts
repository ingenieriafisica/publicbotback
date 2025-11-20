import { Controller, Post, Body, BadRequestException, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  
  constructor(private readonly authService: AuthService, private userService: UsersService) {}

  @Post('login')
  login(@Body() loginDto: LoginAuthDto) {
    console.log('se recivió una petición de login:', loginDto); 
    return this.authService.login(loginDto);
  }


  @Post('logout')
  @HttpCode(200)
  logout() {
    // Aquí podríamos manejar la invalidación del token si fuera necesario
    return { message: 'Logout exitoso' };
  }
}