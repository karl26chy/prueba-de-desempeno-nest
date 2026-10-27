import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Decorador personalizado para extraer el usuario autenticado del request
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data && user ? user[data] : user;
  },
);
