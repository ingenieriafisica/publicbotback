import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, versionKey: false })
export class User {

  @Prop({ required: true, unique: true, index: true })
  identificacion: number;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@sena\.edu\.co$/, 'escriba email sena'] })
  correo_sena: string;

  @Prop({ required: true })
  numero_celular: string;

  @Prop({ default: true })
  estado_actual: boolean;

  @Prop({ required: true })
  rol_asignado: string;

  @Prop({ required: true, select: true }) // 'select: false' para no retornar por defecto en las consultas
  password: string;

}

export const UserSchema = SchemaFactory.createForClass(User);