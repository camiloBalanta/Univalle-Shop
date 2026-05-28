import { DomainException } from '../base-classes/domain-exception';

export class UsuarioDomainException extends DomainException {
  constructor(message: string, code: string = 'USUARIO_ERROR') {
    super(message, code);
    Object.setPrototypeOf(this, UsuarioDomainException.prototype);
  }

  static userNotFound(id: string): UsuarioDomainException {
    return new UsuarioDomainException(
      `Usuario ${id} no encontrado`,
      'USER_NOT_FOUND',
    );
  }

  static userCodeAlreadyExists(
    codigo: string,
    anioRegistro: number,
  ): UsuarioDomainException {
    return new UsuarioDomainException(
      `El usuario con codigo ${codigo} y ano de registro ${anioRegistro} ya existe`,
      'USER_CODE_ALREADY_EXISTS',
    );
  }

  static invalidAccessCode(): UsuarioDomainException {
    return new UsuarioDomainException(
      'El codigo de acceso debe ser numerico e iniciar con 1, 2 o 3',
      'INVALID_ACCESS_CODE',
    );
  }

  static invalidRegistrationYear(): UsuarioDomainException {
    return new UsuarioDomainException(
      'El ano de registro no es valido',
      'INVALID_REGISTRATION_YEAR',
    );
  }

  static invalidCredentials(): UsuarioDomainException {
    return new UsuarioDomainException(
      'Las credenciales son incorrectas',
      'INVALID_CREDENTIALS',
    );
  }

  static weakPassword(): UsuarioDomainException {
    return new UsuarioDomainException(
      'La nueva contrasena debe tener al menos 8 caracteres',
      'WEAK_PASSWORD',
    );
  }
}
