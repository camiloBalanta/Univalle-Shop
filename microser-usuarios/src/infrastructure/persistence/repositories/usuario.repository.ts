import { IUsuarioRepository } from '../../../domain/ports/usuario-repository.port';
import { Usuario } from '../../../domain/entities/usuario';
import { UsuarioMapper } from '../mappers/usuario.mapper';

export class UsuarioRepositoryMemory implements IUsuarioRepository {
  private usuarios: Map<string, any> = new Map();
  private mapper = new UsuarioMapper();

  async save(usuario: Usuario): Promise<Usuario> {
    const data = this.mapper.toPersistence(usuario);
    this.usuarios.set(usuario.id, data);
    return usuario;
  }

  async findById(id: string): Promise<Usuario | null> {
    const data = this.usuarios.get(id);
    if (!data) return null;
    return this.mapper.toDomain(data);
  }

  async findByCodigo(codigo: string): Promise<Usuario | null> {
    for (const data of this.usuarios.values()) {
      if (data.codigo === codigo) {
        return this.mapper.toDomain(data);
      }
    }
    return null;
  }

  async findByCodigoAndAnioRegistro(
    codigo: string,
    anioRegistro: number,
  ): Promise<Usuario | null> {
    for (const data of this.usuarios.values()) {
      if (data.codigo === codigo && data.anioRegistro === anioRegistro) {
        return this.mapper.toDomain(data);
      }
    }
    return null;
  }

  async delete(id: string): Promise<void> {
    this.usuarios.delete(id);
  }

  async findAll(): Promise<Usuario[]> {
    return Array.from(this.usuarios.values()).map(data =>
      this.mapper.toDomain(data)
    );
  }
}
