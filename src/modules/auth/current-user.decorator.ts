import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export interface CurrentUserData {
  userId: string;
  email?: string;
  role?: string;
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentUserData => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user as any;
  if (!user?.userId) throw new UnauthorizedException();
  return user;
}); 
