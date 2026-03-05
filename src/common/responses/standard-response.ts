/**
 * Respuesta estándar exitosa de la API
 * Se aplica automáticamente a través del ResponseInterceptor
 */
export class StandardResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;

  constructor(statusCode: number, message: string, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Respuesta estándar de error de la API
 * Se aplica automáticamente a través del AllExceptionsFilter
 */
export class StandardErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, any>;
  timestamp: string;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, any>
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }
}
