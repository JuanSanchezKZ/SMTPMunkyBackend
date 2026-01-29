import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuditService } from './audit.service';
import { Request } from 'express';

@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const user = (req as any).user;

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || undefined;
    const userAgent = req.headers['user-agent'];

    return new Observable((subscriber) => {
      this.audit
        .runWithContext({ actorId: user?.userId, ip: ip?.toString(), userAgent }, async () => {
          return new Promise<void>((resolve, reject) => {
            const sub = next.handle().subscribe({
              next: (value) => subscriber.next(value),
              error: (err) => {
                subscriber.error(err);
                reject(err);
              },
              complete: () => {
                subscriber.complete();
                resolve();
              },
            });
            // cleanup
            return () => sub.unsubscribe();
          });
        })
        .catch((err) => subscriber.error(err));
    });
  }
}
