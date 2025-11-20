import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from './entities/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject('USERS_MODEL') private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el correo ya existe
    const existingUser = await this.userModel.findOne({ 
      correo_sena: createUserDto.correo_sena 
    }).exec();
    
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const userData = { ...createUserDto };

    if (createUserDto.password) {
      userData.password = await bcrypt.hash(createUserDto.password, 10);
    } else {
      delete userData.password;
    }

    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec(); // Excluir password
  }

  async findOne(_id: string): Promise<User> {
    const user = await this.userModel.findById(_id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con id: ${_id}`);
    }
    return user;
  }

  async findByEmail(correo_sena: string): Promise<User> {
    const user = await this.userModel.findOne({ correo_sena }).exec();
    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con email: ${correo_sena}`);
    }
    return user;
  }

  // ELIMINAR el método duplicado findByCorreo

  async findByUsuarioAsignado(usuario_asignado: string): Promise<User> {
    const user = await this.userModel.findOne({ usuario_asignado }).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con nombre de usuario: ${usuario_asignado}`);
    }
    return user;
  }

  async update(_id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Si se está actualizando la contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Si se está actualizando el correo, verificar que no exista
    if (updateUserDto.correo_sena) {
      const existingUser = await this.userModel.findOne({ 
        correo_sena: updateUserDto.correo_sena,
        _id: { $ne: _id } // Excluir el usuario actual
      }).exec();
      
      if (existingUser) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(_id, updateUserDto, { new: true })
      .select('-password')
      .exec();
      
    if (!updatedUser) {
      throw new NotFoundException(`No se encontró el usuario con id: ${_id}`);
    }
    return updatedUser;
  }

  async remove(_id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(_id).select('-password').exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${_id} not found`);
    }
    return deletedUser;
  }

  // Método útil para autenticación (si lo necesitas)
  async validateUser(correo_sena: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ correo_sena }).exec();
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }
}