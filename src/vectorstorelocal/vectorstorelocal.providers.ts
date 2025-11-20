import { Connection } from 'mongoose';
import { VectorlocalSchema } from './entities/vectorlocal.schema';

export const vectorstorelocalProviders = [
  {
    provide: 'VECTOR_LOCAL_MODEL',
    useFactory: (connection: Connection) => connection.model('nomicvectors', VectorlocalSchema  ),
    inject: ['DATABASE_CONNECTION'],
  },
];
