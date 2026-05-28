import { Injectable, Inject } from '@nestjs/common';
import { IUsuarioRepository } from '../../domain/ports/usuario-repository.port';
import { UsuarioDomainException } from '../../domain/exceptions/usuario-domain-exception';

@Injectable()
export class EliminarUsuarioUseCase {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(usuarioId: string): Promise<void> {
    const usuario = await this.usuarioRepository.findById(usuarioId);

    if (!usuario) {
      throw UsuarioDomainException.userNotFound(usuarioId);
    }

    
    await this.usuarioRepository.delete(usuarioId);
  }
}