import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from 'src/database/database.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usuariosProviders } from './users.providers';

@Module({
  imports: [DatabaseModule, MongooseModule],
  controllers: [UsersController],
  providers: [UsersService, ...usuariosProviders],
  exports: [UsersService, ...usuariosProviders]
})
export class UsersModule {}
