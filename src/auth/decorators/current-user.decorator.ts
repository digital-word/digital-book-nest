import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Request } from 'express';

/** Extracts the Firebase decoded ID token attached by FirebaseAuthGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): DecodedIdToken => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as DecodedIdToken;
  },
);
