import { Inject, Injectable } from '@nestjs/common';
import { IUsuarioRepository } from '../../domain/ports/usuario-repository.port';
import { LoginDTO, LoginResponseDTO } from '../dto/usuario.dto';
import { UsuarioDomainException } from '../../domain/exceptions/usuario-domain-exception';
import { PasswordService } from '../../infrastructure/security/password.service';
import { TokenService } from '../../infrastructure/security/token.service';
import { CodigoAcceso } from '../../domain/value-objects/codigo-acceso';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: LoginDTO): Promise<LoginResponseDTO> {
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

    const usuario = await this.usuarioRepository.findByCodigoAndAnioRegistro(
      acceso.codigo,
      acceso.anioRegistro,
    );
    if (!usuario) {
      throw UsuarioDomainException.invalidCredentials();
    }

    const isValidPassword = this.passwordService.verifyPassword(
      dto.password,
      usuario.passwordHash,
    );

    if (!isValidPassword) {
      throw UsuarioDomainException.invalidCredentials();
    }

    const token = this.tokenService.generateToken({
      userId: usuario.id,
      codigo: usuario.codigo,
      anioRegistro: usuario.anioRegistro,
      rol: usuario.rol,
    });

    return {
      userId: usuario.id,
      codigo: usuario.codigo,
      anioRegistro: usuario.anioRegistro,
      rol: usuario.rol,
      mustChangePassword: usuario.mustChangePassword,
      message: usuario.mustChangePassword
        ? 'Ingreso exitoso. Debes cambiar tu contrasena temporal.'
        : 'Ingreso exitoso.',
      token,
    };
  }
}
