import { MongoClient, Db } from 'mongodb';
import { ensureUsuarioCollectionSchema } from './repositories/schemas/usuario.schema';

let connection: MongoClient;
let db: Db;

export async function connectMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI no está definida en las variables de entorno');
  }

  connection = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  await connection.connect();
  db = connection.db();
  await db.command({ ping: 1 });
  await ensureUsuarioCollectionSchema(db);

  console.log(`✅ Conectado a MongoDB Atlas (${db.databaseName})`);
  return db;
}

export function getMongoDb(): Db {
  if (!db) {
    throw new Error('MongoDB no está conectado');
  }
  return db;
}

export async function disconnectMongoDB(): Promise<void> {
  if (connection) {
    await connection.close();
    connection = undefined as unknown as MongoClient;
    db = undefined as unknown as Db;
    console.log('❌ Desconectado de MongoDB');
  }
}
