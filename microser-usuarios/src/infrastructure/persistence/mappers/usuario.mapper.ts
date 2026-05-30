import { Mapper } from './base-mapper';
import { UsuarioResponseDTO } from '../../../application/dto/usuario.dto';
import { Usuario } from '../../../domain/entities/usuario';

export class UsuarioMapper extends Mapper<Usuario, UsuarioResponseDTO> {
  public toPersistence(domain: Usuario): any {
    return {
      id: domain.id,
      codigo: domain.codigo,
      anioRegistro: domain.anioRegistro,
      rol: domain.rol,
      fullName: domain.fullName,
      email: domain.email,
      isActive: domain.isActive,
      passwordHash: domain.passwordHash,
      mustChangePassword: domain.mustChangePassword,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  public toDomain(raw: any): Usuario {
    return Usuario.reconstruct({
      id: raw.id,
      codigo: raw.codigo,
      anioRegistro: raw.anioRegistro,
      rol: raw.rol,
      fullName: raw.fullName ?? '',
      email: raw.email ?? '',
      isActive: raw.isActive ?? true,
      passwordHash: raw.passwordHash,
      mustChangePassword: Boolean(raw.mustChangePassword),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public toDTO(domain: Usuario): UsuarioResponseDTO {
    return {
      id: domain.id,
      codigo: domain.codigo,
      anioRegistro: domain.anioRegistro,
      rol: domain.rol,
      fullName: domain.fullName,
      email: domain.email,
      isActive: domain.isActive,
      mustChangePassword: domain.mustChangePassword,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }
}
