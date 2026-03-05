import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StandardResponse } from '../responses/standard-response';

/**
 * Interceptor global que estandariza todas las respuestas exitosas
 * Convierte el retorno de cualquier controlador a formato:
 * {
 *   statusCode: number,
 *   message: string,
 *   data?: any,
 *   timestamp: ISO8601
 * }
 *
 * Se aplica globalmente en main.ts
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<StandardResponse<any>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data) => {
        // Si el controlador ya retorna StandardResponse, no envolver
        if (data instanceof StandardResponse) {
          return data;
        }

        // Si el controlador retorna un objeto con message y data
        if (data && typeof data === 'object' && 'message' in data) {
          return new StandardResponse(
            statusCode,
            data.message,
            data.data || data
          );
        }

        // Para cualquier otro dato, envolver en StandardResponse
        const message = this.getDefaultMessage(statusCode);
        return new StandardResponse(statusCode, message, data);
      })
    );
  }

  private getDefaultMessage(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.OK:
        return 'Operación completada exitosamente';
      case HttpStatus.CREATED:
        return 'Recurso creado exitosamente';
      case HttpStatus.NO_CONTENT:
        return 'Operación completada';
      default:
        return 'Solicitud procesada exitosamente';
    }
  }
}
