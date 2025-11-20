import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VectorDocument = HydratedDocument<OpenaiVector>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class OpenaiVector {

  @Prop({ required: true })
  document: string;

  @Prop({ required: true })
  embedding: number[];
  
}

export const OpenaiVectorSchema = SchemaFactory.createForClass(OpenaiVector);
