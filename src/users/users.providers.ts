import { Connection } from 'mongoose';
import { UserSchema } from './entities/user.schema';

export const usuariosProviders = [
  {
    provide: 'USERS_MODEL',
    useFactory: (connection: Connection) => connection.model('Usuario', UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
