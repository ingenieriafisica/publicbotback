import { Connection } from 'mongoose';
import { VectorlocalSchema } from 'src/vectorstorelocal/entities/vectorlocal.schema';

export const vectorizetextProviders = [
  {
    provide: 'VECTORIZE_LOCAL_MODEL',
    useFactory: (connection: Connection) => connection.model('nomicvectors', VectorlocalSchema  ),
    inject: ['DATABASE_CONNECTION'],
  },
];
