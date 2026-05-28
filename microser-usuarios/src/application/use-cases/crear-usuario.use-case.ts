import { Inject, Injectable } from '@nestjs/common';
import { IUsuarioRepository } from '../../domain/ports/usuario-repository.port';
import { Usuario } from '../../domain/entities/usuario';
import { CrearUsuarioDTO } from '../dto/usuario.dto';
import { UsuarioDomainException } from '../../domain/exceptions/usuario-domain-exception';
import { UsuarioApplicationService } from '../services/usuario-application.service';
import { PasswordService } from '../../infrastructure/security/password.service';
import { CodigoAcceso } from '../../domain/value-objects/codigo-acceso';
import { SolicitarAccesoResponseDTO } from '../dto/usuario.dto';

@Injectable()
export class CrearUsuarioUseCase {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly applicationService: UsuarioApplicationService,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(dto: CrearUsuarioDTO): Promise<SolicitarAccesoResponseDTO> {
    let acceso: CodigoAcceso;

    try {
      acceso = CodigoAcceso.create(dto.codigo, dto.anioRegistro);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message === 'Invalid registration year') {
        throw UsuarioDomainException.invalidRegistrationYear();
      }
      throw UsuarioDomainException.invalidAccessCode();
    }

    const usuarioExistente =
      await this.usuarioRepository.findByCodigoAndAnioRegistro(
        acceso.codigo,
        acceso.anioRegistro,
      );

    if (usuarioExistente) {
      throw UsuarioDomainException.userCodeAlreadyExists(
        acceso.codigo,
        acceso.anioRegistro,
      );
    }

    const temporaryPassword = this.passwordService.generateTemporaryPassword();
    const passwordHash = this.passwordService.hashPassword(temporaryPassword);

    const usuario = Usuario.create(
      acceso.codigo,
      acceso.anioRegistro,
      passwordHash,
    );
    await this.applicationService.saveAndPublishEvents(usuario);

    return {
      userId: usuario.id,
      codigo: usuario.codigo,
      anioRegistro: usuario.anioRegistro,
      rol: usuario.rol,
      mustChangePassword: usuario.mustChangePassword,
      message:
        'Usuario creado. Se genero una contrasena temporal que debe cambiarse al ingresar.',
      temporaryPassword,
    };
  }
}
