import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PromptDocument = HydratedDocument<Prompt>;

@Schema({ versionKey: false, timestamps: true })
export class Prompt {

  @Prop({ required: true })
  userPrompt: string;

  @Prop({ required: true })
  chatbotResponse: string;
}

export const PromptSchema = SchemaFactory.createForClass(Prompt);

const SECONDS_IN_30_DAYS = 2592000;

PromptSchema.index(
  { createdAt: 1 }, 
  { expireAfterSeconds: SECONDS_IN_30_DAYS }
);