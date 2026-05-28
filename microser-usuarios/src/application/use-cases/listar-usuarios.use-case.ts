import { Injectable, Inject } from '@nestjs/common';
import { IUsuarioRepository } from '../../domain/ports/usuario-repository.port';
import { Usuario } from '../../domain/entities/usuario'

@Injectable()
export class ListarUsuariosUseCase {
  constructor(
    @Inject('IUsuarioRepository') private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(): Promise<Usuario[]> {
    return await this.usuarioRepository.findAll();
  }
}
