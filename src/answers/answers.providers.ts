import { Connection } from 'mongoose';
import { AnswerSchema } from './entities/answer.schema';

export const answersProviders = [
  {
    provide: 'ANSWERS_MODEL',
    useFactory: (connection: Connection) => connection.model('Answer', AnswerSchema ),
    inject: ['DATABASE_CONNECTION'],
  },
];