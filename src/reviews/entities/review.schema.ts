import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ versionKey: false, timestamps: true })
export class Review {
  @Prop({ required: false, trim: true })
  nombre_completo: string;

  @Prop({ required: false, trim: true, unique: true })
  correo_electronico: string;

  @Prop({ required: true, trim: true })
  tipo_solicitud: string;

  @Prop({ required: true, trim: true })
  mensaje_pqrs: string;

  @Prop({ required: false, min: 1, max: 5 })
  calificacion_dada: number;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);