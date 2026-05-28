import { Db } from 'mongodb';

export const USUARIO_COLLECTION = 'usuarios';

export interface UsuarioDocument {
  _id: string;
  id: string;
  codigo: string;
  anioRegistro: number;
  rol: string;
  passwordHash: string;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const usuarioCollectionValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: [
      '_id',
      'id',
      'codigo',
      'anioRegistro',
      'rol',
      'passwordHash',
      'mustChangePassword',
      'createdAt',
      'updatedAt',
    ],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'string',
        description: 'UUID del usuario usado como llave primaria',
      },
      id: {
        bsonType: 'string',
        description: 'UUID del usuario',
      },
      codigo: {
        bsonType: 'string',
        description: 'Codigo institucional usado para ingresar',
        pattern: '^[123][0-9]*$',
      },
      anioRegistro: {
        bsonType: 'number',
        description: 'Ano en el que se registro el usuario',
        minimum: 1900,
      },
      rol: {
        enum: ['administrativo', 'docente', 'estudiante'],
        description: 'Rol derivado del primer digito del codigo',
      },
      passwordHash: {
        bsonType: 'string',
        description: 'Hash de la contrasena del usuario',
      },
      mustChangePassword: {
        bsonType: 'bool',
        description: 'Indica si el usuario debe cambiar la contrasena al ingresar',
      },
      createdAt: {
        bsonType: 'date',
        description: 'Fecha de creacion del usuario',
      },
      updatedAt: {
        bsonType: 'date',
        description: 'Fecha de ultima actualizacion del usuario',
      },
    },
  },
};

export async function ensureUsuarioCollectionSchema(db: Db): Promise<void> {
  const collectionExists = await db
    .listCollections({ name: USUARIO_COLLECTION }, { nameOnly: true })
    .hasNext();

  if (!collectionExists) {
    await db.createCollection(USUARIO_COLLECTION, {
      validator: usuarioCollectionValidator,
    });
  } else {
    await db.command({
      collMod: USUARIO_COLLECTION,
      validator: usuarioCollectionValidator,
    });
  }
  const collection = db.collection<UsuarioDocument>(USUARIO_COLLECTION);
  const indexes = await collection.indexes();

  if (indexes.some((index) => index.name === 'uq_usuarios_email')) {
    await collection.dropIndex('uq_usuarios_email');
  }

  await collection.createIndex(
    { codigo: 1, anioRegistro: 1 },
    { unique: true, name: 'uq_usuarios_codigo_anio' },
  );
}
