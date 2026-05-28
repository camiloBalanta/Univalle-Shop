/**
 * VALIDADOR PERSONALIZADO: IsValidUserId
 *
 * Validador personalizado para validar el formato de userId.
 */

import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidUserId', async: false })
export class IsValidUserIdConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    // userId debe ser alfanumérico, puede contener guiones y guiones bajos
    const userIdRegex = /^[a-zA-Z0-9_-]{1,100}$/;
    return userIdRegex.test(value.trim());
  }

  defaultMessage(): string {
    return 'El userId debe tener entre 1 y 100 caracteres alfanuméricos (se permiten guiones y guiones bajos)';
  }
}

export function IsValidUserId(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidUserIdConstraint,
    });
  };
}
