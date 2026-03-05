import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StandardErrorResponse } from '../responses/standard-response';

/**
 * Filtro global de excepciones que estandariza todas las respuestas de error
 * Convierte cualquier excepción a formato:
 * {
 *   statusCode: number,
 *   message: string,
 *   errors?: Record<string, any>,
 *   timestamp: ISO8601
 * }
 *
 * Se aplica globalmente en main.ts
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: Record<string, any> | undefined;

    // Manejo de HttpException (BadRequest, Unauthorized, etc.)
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const errorObj = exceptionResponse as any;

        // Validación de NestJS (ValidationPipe)
        if (errorObj.message && Array.isArray(errorObj.message)) {
          message = 'Validación fallida';
          errors = this.formatValidationErrors(errorObj.message);
        }
        // Otros errores HTTP con estructura personalizada
        else if (errorObj.message) {
          message = errorObj.message;
          if (errorObj.error) {
            errors = { details: errorObj.error };
          }
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    }
    // Errores no controlados
    else if (exception instanceof Error) {
      message = exception.message || 'Error interno del servidor';
      if (process.env.NODE_ENV !== 'production') {
        errors = { stack: exception.stack };
      }
    }

    const errorResponse = new StandardErrorResponse(
      statusCode,
      message,
      errors
    );

    response.status(statusCode).json(errorResponse);
  }

  /**
   * Formatea los errores de validación del ValidationPipe
   * Convierte estructura de NestJS a formato más legible
   */
  private formatValidationErrors(
    validationErrors: any[]
  ): Record<string, string[]> | undefined {
    const formatted: Record<string, string[]> = {};

    validationErrors.forEach((error) => {
      if (error.property && error.constraints) {
        formatted[error.property] = Object.values(error.constraints);
      }
    });

    return Object.keys(formatted).length > 0 ? formatted : undefined;
  }
}
