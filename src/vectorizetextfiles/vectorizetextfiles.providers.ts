import { Connection } from 'mongoose';
import { VectorlocalSchema } from 'src/vectorstorelocal/entities/vectorlocal.schema';

export const vectorizetextfilesProviders = [
  {
    provide: 'VECTORIZE_TEXT_FILES_MODEL',
    useFactory: (connection: Connection) => connection.model('nomicvectors', VectorlocalSchema  ),
    inject: ['DATABASE_CONNECTION'],
  },
];
