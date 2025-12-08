import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // kalo errornya dari httpexception (misal badrequest), pake statusnya.
    // kalo error coding (bug), anggep 500 internal server error
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message =
        typeof errorResponse === 'string'
          ? errorResponse
          : errorResponse['message'];
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      },
    });
  }
}
