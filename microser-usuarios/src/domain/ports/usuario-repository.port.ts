import { Usuario } from '../entities/usuario';

export interface IUsuarioRepository {
  save(usuario: Usuario): Promise<Usuario>; 
  findById(id: string): Promise<Usuario | null>;
  findByCodigo(codigo: string): Promise<Usuario | null>;
  findByCodigoAndAnioRegistro(
    codigo: string,
    anioRegistro: number,
  ): Promise<Usuario | null>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Usuario[]>;
}

export interface IDomainEventPublisher {
  publish(events: any[]): Promise<void>;
}
