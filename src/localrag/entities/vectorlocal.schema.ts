import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Localvector extends Document {
  @Prop({ required: true })
  document: string;

  @Prop({ type: [Number], required: true })
  embedding: number[];

  @Prop({ required: true })
  chunkId: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  indexedAt: string;
}

export const LocalvectorSchema = SchemaFactory.createForClass(Localvector);

// Create vector index for similarity search
//LocalvectorSchema.index({ embedding: '2dsphere' });