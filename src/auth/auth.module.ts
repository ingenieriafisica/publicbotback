import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UsersService } from 'src/users/users.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    DatabaseModule,
    MongooseModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      global:true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,UsersService],
  exports: [AuthService],
})
export class AuthModule {}
