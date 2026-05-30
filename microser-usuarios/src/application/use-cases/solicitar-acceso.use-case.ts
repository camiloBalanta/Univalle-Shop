import { Inject, Injectable } from '@nestjs/common';
import {
  SolicitarAccesoDTO,
  SolicitarAccesoResponseDTO,
} from '../dto/usuario.dto';
import { IUsuarioRepository } from '../../domain/ports/usuario-repository.port';
import { UsuarioApplicationService } from '../services/usuario-application.service';
import { UsuarioDomainException } from '../../domain/exceptions/usuario-domain-exception';
import { Usuario } from '../../domain/entities/usuario';
import { PasswordService } from '../../infrastructure/security/password.service';
import { CodigoAcceso } from '../../domain/value-objects/codigo-acceso';

@Injectable()
export class SolicitarAccesoUseCase {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly applicationService: UsuarioApplicationService,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(
    dto: SolicitarAccesoDTO,
  ): Promise<SolicitarAccesoResponseDTO> {
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

    const temporaryPassword = this.passwordService.generateTemporaryPassword();
    const passwordHash = this.passwordService.hashPassword(temporaryPassword);

    let usuario = await this.usuarioRepository.findByCodigoAndAnioRegistro(
      acceso.codigo,
      acceso.anioRegistro,
    );

    if (!usuario) {
      usuario = Usuario.create(
        acceso.codigo,
        acceso.anioRegistro,
        passwordHash,
      );
      await this.applicationService.saveAndPublishEvents(usuario);
    } else {
      usuario.assignTemporaryPassword(passwordHash);
      await this.usuarioRepository.save(usuario);
    }

    return {
      userId: usuario.id,
      codigo: usuario.codigo,
      anioRegistro: usuario.anioRegistro,
      rol: usuario.rol,
      fullName: usuario.fullName ?? '',
      email: usuario.email ?? '',
      isActive: usuario.isActive ?? true,
      mustChangePassword: usuario.mustChangePassword,
      message:
        'Se genero una contrasena temporal que debe cambiarse al ingresar.',
      temporaryPassword,
    };
  }
}
