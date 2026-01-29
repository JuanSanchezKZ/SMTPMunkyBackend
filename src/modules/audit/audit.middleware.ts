import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuditService } from './audit.service';

@Injectable()
export class AuditContextMiddleware implements NestMiddleware {
  constructor(private readonly audit: AuditService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const actorId = (req.user as any)?.userId;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || undefined;
    const userAgent = req.headers['user-agent'];

    this.audit.runWithContext({ actorId, ip: ip?.toString(), userAgent }, async () => {
      next();
    });
  }
}
