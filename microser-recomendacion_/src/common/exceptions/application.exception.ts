/**
 * EXCEPCIÓN BASE: ApplicationException
 *
 * Excepción personalizada base para toda la aplicación.
 * Proporciona estructura consistente para errores.
 */

export abstract class ApplicationException extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ApplicationException.prototype);
  }

  toResponse() {
    return {
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      timestamp: new Date().toISOString(),
    };
  }
}
