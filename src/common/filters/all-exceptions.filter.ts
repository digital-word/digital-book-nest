import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface FirebaseLikeError {
  errorInfo?: { code?: string };
  code?: string;
}

function isFirebaseLikeError(error: unknown): error is FirebaseLikeError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('errorInfo' in error || 'code' in error)
  );
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      // pass through as-is (validation errors, 404s, etc.)
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    // FirebaseAppError (or similar) expose `.code`
    const code = isFirebaseLikeError(exception)
      ? (exception.errorInfo?.code ?? exception.code)
      : undefined;
    const message = code
      ? `Internal server error - ${code}`
      : 'Internal server error';

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
    });
  }
}
