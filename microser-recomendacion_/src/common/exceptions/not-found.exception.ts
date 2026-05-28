import { ApplicationException } from './application.exception';

/**
 * EXCEPCIÓN: NotFound
 *
 * Se lanza cuando un recurso no es encontrado (ej: usuario sin recomendaciones)
 */
export class NotFoundException extends ApplicationException {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';

  constructor(message: string = 'Recurso no encontrado') {
    super(message);
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}
