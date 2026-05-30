import { Injectable } from '@nestjs/common';
import { IUsuarioRepository } from '../../../domain/ports/usuario-repository.port';
import { Usuario } from '../../../domain/entities/usuario';
import { UsuarioMapper } from '../mappers/usuario.mapper';
import { getMongoDb } from '../mongo.connection';
import { UsuarioDocument, USUARIO_COLLECTION } from './schemas/usuario.schema';

@Injectable()
export class MongoUsuarioRepository implements IUsuarioRepository {
  private collectionName = USUARIO_COLLECTION;
  private mapper = new UsuarioMapper();

  async save(usuario: Usuario): Promise<Usuario> {
    const db = getMongoDb();
    const collection = db.collection<UsuarioDocument>(this.collectionName);

    const data = this.mapper.toPersistence(usuario);

    await collection.updateOne(
      { _id: data.id },
      { $set: { ...data, _id: data.id } },
      { upsert: true }
    );

    return usuario;
  }

  async findById(id: string): Promise<Usuario | null> {
    const db = getMongoDb();
    const collection = db.collection<UsuarioDocument>(this.collectionName);

    const data = await collection.findOne({ _id: id });
    if (!data) return null;

    return this.mapper.toDomain({
      id: String(data._id),
      ...data
    });
  }

  async findByCodigo(codigo: string): Promise<Usuario | null> {
    const db = getMongoDb();
    const collection = db.collection<UsuarioDocument>(this.collectionName);

    const data = await collection.findOne({ codigo });
    if (!data) return null;

    return this.mapper.toDomain({
      id: String(data._id),
      ...data
    });
  }

  async findByCodigoAndAnioRegistro(
    codigo: string,
    anioRegistro: number,
  ): Promise<Usuario | null> {
    const db = getMongoDb();
    const collection = db.collection<UsuarioDocument>(this.collectionName);

    const data = await collection.findOne({ codigo, anioRegistro });
    if (!data) return null;

    return this.mapper.toDomain({
      id: String(data._id),
      ...data
    });
  }

  async delete(id: string): Promise<void> {
    const db = getMongoDb();
    const collection = db.collection<UsuarioDocument>(this.collectionName);

    await collection.deleteOne({ _id: id });
  }

  async findAll(): Promise<Usuario[]> {
    const db = getMongoDb();
    const collection = db.collection<UsuarioDocument>(this.collectionName);

    const usuarios = await collection.find().toArray();

    return usuarios.map(u =>
      this.mapper.toDomain({
        id: String(u._id),
        ...u
      })
    );
  }
}
