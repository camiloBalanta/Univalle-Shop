/**
 * FILTER: HTTP Exception Filter
 *
 * Captura excepciones personalizadas y HTTP exceptions.
 * Las convierte a respuestas JSON estandarizadas.
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApplicationException } from '../exceptions';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let statusCode = 500;
    let body: any = {
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
    };

    // Excepciones personalizadas
    if (exception instanceof ApplicationException) {
      statusCode = exception.statusCode;
      body = exception.toResponse();
      this.logger.warn(
        `[${exception.code}] ${exception.message} - ${request.method} ${request.url}`,
      );
    }
    // Excepciones HTTP de NestJS
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const responseData = exception.getResponse();

      body = {
        statusCode,
        code: statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST',
        message:
          typeof responseData === 'object'
            ? (responseData as any).message || exception.message
            : exception.message,
        timestamp: new Date().toISOString(),
      };

      this.logger.warn(
        `[HTTP ${statusCode}] ${body.message} - ${request.method} ${request.url}`,
      );
    }
    // Errores no capturados
    else {
      this.logger.error(
        `[UNCAUGHT] ${exception instanceof Error ? exception.message : 'Unknown error'} - ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(statusCode).json(body);
  }
}
