import {Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Query, UseGuards, ConflictException, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.schema';
import { JwtGuard } from 'src/auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.usersService.createUser(createUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Get()
  async findAll(
    @Query('correo_sena') correo_sena?: string, 
    @Query('usuario_asignado') usuario_asignado?: string
  ): Promise<User[] | User> {
    if (correo_sena) {
      try {
        return await this.usersService.findByEmail(correo_sena);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new NotFoundException(`El usuario con el correo: ${correo_sena} no fue encontrado.`);
        }
        throw error;
      }
    } else if (usuario_asignado) {
      try {
        return await this.usersService.findByUsuarioAsignado(usuario_asignado);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new NotFoundException(`El usuario con nombre: ${usuario_asignado} no fue encontrado.`);
        }
        throw error;
      }
    } else {
      return this.usersService.findAll();
    }
  }

  @Get(':id')
  async findJustOne(@Param('id') _id: string): Promise<User> {
    try {
      return await this.usersService.findOne(_id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`El usuario con ID ${_id} no fue encontrado.`);
      }
      throw error;
    }
  }

  @Patch(':id')
  async update(@Param('id') _id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    try {
      return await this.usersService.update(_id, updateUserDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`El usuario con ID ${_id} no fue encontrado.`);
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') _id: string): Promise<void> {
    try {
      await this.usersService.remove(_id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`El usuario con ID ${_id} no fue encontrado.`);
      }
      throw error;
    }
  }
}