import { Inject, Injectable } from '@nestjs/common';
import { IUsuarioRepository } from '../../domain/ports/usuario-repository.port';
import { UsuarioDomainException } from '../../domain/exceptions/usuario-domain-exception';
import { ActualizarUsuarioDTO } from '../dto/usuario.dto';
import { CodigoAcceso } from '../../domain/value-objects/codigo-acceso';

@Injectable()
export class ActualizarUsuarioUseCase {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(id: string, dto: ActualizarUsuarioDTO): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);

    if (!usuario) {
      throw UsuarioDomainException.userNotFound(id);
    }

    if (dto.codigo || dto.anioRegistro) {
      let acceso: CodigoAcceso;

      try {
        acceso = CodigoAcceso.create(
          dto.codigo ?? usuario.codigo,
          dto.anioRegistro ?? usuario.anioRegistro,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message === 'Invalid registration year') {
          throw UsuarioDomainException.invalidRegistrationYear();
        }
        throw UsuarioDomainException.invalidAccessCode();
      }

      const usuarioConCodigo =
        await this.usuarioRepository.findByCodigoAndAnioRegistro(
          acceso.codigo,
          acceso.anioRegistro,
        );

      if (usuarioConCodigo && usuarioConCodigo.id !== usuario.id) {
        throw UsuarioDomainException.userCodeAlreadyExists(
          acceso.codigo,
          acceso.anioRegistro,
        );
      }

      usuario.updateAccessData(
        acceso.codigo,
        acceso.anioRegistro,
      );
    }

    await this.usuarioRepository.save(usuario);
  }
}
