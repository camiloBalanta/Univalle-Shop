/**
 * DECORATOR: ValidateUserIdParam
 *
 * Decorator que valida el userId del parámetro de ruta.
 * Se usa en controllers para validar @Param('userId').
 */

import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const ValidateUserIdParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.params.userId;

    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new BadRequestException(
        'El userId del parámetro es requerido y debe ser una cadena no vacía',
      );
    }

    // Validar formato
    const userIdRegex = /^[a-zA-Z0-9_-]{1,100}$/;
    if (!userIdRegex.test(userId.trim())) {
      throw new BadRequestException(
        'El userId debe tener entre 1 y 100 caracteres alfanuméricos (se permiten guiones y guiones bajos)',
      );
    }

    return userId.trim();
  },
);
