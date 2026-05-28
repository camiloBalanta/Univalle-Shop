import 'dotenv/config';
import { randomUUID } from 'crypto';

process.env.MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const { connectMongoDB, disconnectMongoDB } = require('./src/infrastructure/persistence/mongo.connection');
const { PasswordService } = require('./src/infrastructure/security/password.service');

async function seedAdmin() {
  const db = await connectMongoDB();
  const collection: any = db.collection('usuarios');
  const codigo = '2156756';
  const anioRegistro = 2026;

  const existing = await collection.findOne({ codigo, anioRegistro });
  if (existing) {
    console.log(`El usuario con codigo ${codigo} y ano ${anioRegistro} ya existe.`);
    await disconnectMongoDB();
    return;
  }

  const passwordService = new PasswordService();
  const passwordHash = passwordService.hashPassword('123');
  const id = randomUUID();

  const adminUser = {
    _id: id,
    id,
    codigo,
    anioRegistro,
    rol: 'administrativo',
    passwordHash,
    mustChangePassword: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await collection.insertOne(adminUser);
  console.log(`Usuario administrativo creado: codigo=${codigo}, password=123`);
  await disconnectMongoDB();
}

seedAdmin().catch((error) => {
  console.error('Error al crear el usuario administrativo:', error);
  process.exit(1);
});
