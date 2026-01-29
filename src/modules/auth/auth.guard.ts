import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuardOptional extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const mode = this.config.get<string>('AUTH_MODE', 'jwt');
    if (mode === 'none') {
      const req = context.switchToHttp().getRequest();
      // attach anonymous user
      req.user = { userId: 'anonymous' };
      return true;
    }
    return (super.canActivate(context) as unknown) as boolean;
  }
}
