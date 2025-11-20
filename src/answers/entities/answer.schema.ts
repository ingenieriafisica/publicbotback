import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AnswerDocument = HydratedDocument<Answer>;

@Schema({ versionKey: false, timestamps: true })
export class Answer {

  @Prop()
  role: string;
  
  @Prop()
  content: string;

}

export const AnswerSchema = SchemaFactory.createForClass(Answer);

const SECONDS_IN_30_DAYS = 2592000;

AnswerSchema.index(
  { createdAt: 1 }, // El índice se aplica al campo de creación.
  { expireAfterSeconds: SECONDS_IN_30_DAYS } // El tiempo de vida en segundos.
);