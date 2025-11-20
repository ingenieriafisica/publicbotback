import { Connection } from 'mongoose';
import { LocalvectorSchema } from './entities/vectorlocal.schema';

export const localragProviders = [
  {
    provide: 'LOCAL_VECTOR_MODEL',
    useFactory: (connection: Connection) => connection.model('qwenvector', LocalvectorSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
