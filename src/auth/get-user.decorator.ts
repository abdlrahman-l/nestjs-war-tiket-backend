import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from 'src/types/express';

export const GetUser = createParamDecorator(
  (data: keyof RequestWithUser['user'] | undefined, ctx: ExecutionContext) => {
    // Ambil request object
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    // Ambil user (biasanya di-attach sama Passport/AuthGuard)
    const user = request.user;

    // Safety check kalau user gak ada (misal route public)
    if (!user) return null;

    // Kalau ada data key spesifik (misal @GetUser('email'))
    if (data) {
      return user[data];
    }

    // Balikin full user object
    return user;
  },
);
