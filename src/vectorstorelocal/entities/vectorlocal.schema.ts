import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VectorDocument = HydratedDocument<Vectorlocal>;

@Schema({ timestamps: true, versionKey: false })
export class Vectorlocal {

  @Prop()
  titulo: string;

  @Prop()
  categoria: string;

  @Prop({ type: [Number], required: true })
  embedding: number[];

  @Prop()
  document?: string;

  @Prop({ type: Object })
  metadata?: any;
}

export const VectorlocalSchema = SchemaFactory.createForClass(Vectorlocal);