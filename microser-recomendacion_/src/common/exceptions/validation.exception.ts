import { ApplicationException } from './application.exception';

/**
 * EXCEPCIÓN: Validation
 *
 * Se lanza cuando los datos de entrada no son válidos
 */
export class ValidationException extends ApplicationException {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';

  constructor(
    message: string = 'Error de validación',
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    Object.setPrototypeOf(this, ValidationException.prototype);
  }

  toResponse() {
    return {
      ...super.toResponse(),
      errors: this.errors,
    };
  }
}
