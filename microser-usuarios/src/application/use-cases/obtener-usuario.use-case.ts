import { Injectable, Inject } from '@nestjs/common';
import { IUsuarioRepository } from '../../domain/ports/usuario-repository.port';
import { Usuario } from '../../domain/entities/usuario'
import { UsuarioDomainException } from '../../domain/exceptions/usuario-domain-exception';

@Injectable()
export class ObtenerUsuarioUseCase {
  constructor(
    @Inject('IUsuarioRepository') private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(usuarioId: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw UsuarioDomainException.userNotFound(usuarioId);
    }
    return usuario;
  }
}
