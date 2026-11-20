/**
 * Error con estado HTTP y código legible por el frontend.
 * Se convierte en { error: { code, message, details? } } en el errorHandler.
 */
export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
