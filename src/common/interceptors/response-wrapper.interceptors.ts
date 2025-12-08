import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { IGNORE_WRAPPER_KEY } from '../decorators/ignore-wrapper.decorator';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { Request, Response } from 'express';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
  };
}

@Injectable()
export class ResponseWrapperInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // check ngebypass apa ngga, kirim flag ignore apa ngga
    const shouldIgnore = this.reflector.getAllAndOverride<boolean>(
      IGNORE_WRAPPER_KEY,
      // pertama check di method/handler, kedua check di controller
      [context.getHandler(), context.getClass()],
    );

    if (shouldIgnore) {
      return next.handle();
    }

    const customMessage = this.reflector.getAllAndOverride<string>(
      RESPONSE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const status = response.statusCode;

    return next.handle().pipe(
      map((data: T) => {
        return {
          statusCode: status,
          message: customMessage || 'Success',
          data: data,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
          },
        };
      }),
    );
  }
}
