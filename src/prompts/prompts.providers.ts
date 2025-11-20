import { Connection } from 'mongoose';
import { PromptSchema } from './entities/prompt.schema';

export const promptsProviders = [
  {
    provide: 'PROMPTS_MODEL',
    useFactory: (connection: Connection) => connection.model('Prompts', PromptSchema ),
    inject: ['DATABASE_CONNECTION'],
  },
];