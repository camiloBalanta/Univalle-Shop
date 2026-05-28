import { ApplicationException } from './application.exception';

/**
 * EXCEPCIÓN: Conflict
 *
 * Se lanza cuando hay un conflicto (ej: ya existe una recomendación para este usuario)
 */
export class ConflictException extends ApplicationException {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';

  constructor(message: string = 'Recurso en conflicto') {
    super(message);
    Object.setPrototypeOf(this, ConflictException.prototype);
  }
}
