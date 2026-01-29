import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditContextData {
  actorId?: string;
  ip?: string;
  userAgent?: string;
}

export interface DbChangeRecord {
  action: string;
  model: string;
  recordId?: string | null;
  before?: any;
  after?: any;
}

@Injectable()
export class AuditService {
  private readonly als = new AsyncLocalStorage<AuditContextData>();

  constructor(
  @Inject(forwardRef(() => PrismaService)) // <-- También aquí
  private readonly prisma: PrismaService
) {}

  runWithContext(ctx: AuditContextData, fn: () => Promise<any>) {
    return this.als.run(ctx, fn);
  }

  getContext(): AuditContextData {
    return this.als.getStore() ?? {};
  }

  async recordDbChange(change: DbChangeRecord) {
    // PrismaService uses this even during app init; avoid recursion on AuditLog itself
    if (change.model === 'AuditLog') return;

    const ctx = this.getContext();
    await this.prisma.auditLog.create({
      data: {
        actorId: ctx.actorId && ctx.actorId !== 'anonymous' ? ctx.actorId : null,
        action: change.action,
        model: change.model,
        recordId: change.recordId ?? null,
        before: change.before ?? undefined,
        after: change.after ?? undefined,
        ip: ctx.ip ?? null,
        userAgent: ctx.userAgent ?? null,
      },
    });
  }
}
