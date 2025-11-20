import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> => {
      const uri = process.env.MONGODB_ATLAS_URI;

      if (!uri) {
        throw new Error('MONGODB_ATLAS_URI no se ha definido en el archivo .env');
      }

      return await mongoose.connect(uri);
    },
  },
];