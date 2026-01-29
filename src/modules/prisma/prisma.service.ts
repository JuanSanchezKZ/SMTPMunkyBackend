import { forwardRef, INestApplication, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(forwardRef(() => AuditService)) // <-- Usá forwardRef aquí
    private readonly audit: AuditService
  ) {
    super();
  }

  async onModuleInit() {
    // Middleware for audit trail on writes
    this.$use(async (params, next) => {
      const auditedModels = new Set(['SmtpConfig', 'Contact', 'Template', 'CensusFile', 'CensusSettings', 'EmailMessage', 'User']);
      const isWrite =
        ['create', 'update', 'upsert', 'delete', 'deleteMany', 'updateMany', 'createMany'].includes(params.action);
      if (!auditedModels.has(params.model ?? '') || !isWrite) {
        return next(params);
      }

      const model = params.model!;
      let before: any = null;

      const recordId =
        (params.args?.where?.id as string | undefined) ||
        (params.args?.where?.['id'] as string | undefined) ||
        null;

      // Read "before" state for single-record update/delete
      if (recordId && ['update', 'delete', 'upsert'].includes(params.action)) {
        // @ts-expect-error dynamic model access
        before = await this[model].findUnique({ where: { id: recordId } });
      }

      const result = await next(params);

      // Read "after" state if needed
      let after: any = null;
      if (recordId && ['update', 'upsert'].includes(params.action)) {
        // @ts-expect-error dynamic model access
        after = await this[model].findUnique({ where: { id: recordId } });
      } else if (params.action === 'create') {
        after = result;
      } else if (params.action === 'delete') {
        before = before ?? result;
      }

      // Actor is attached per-request in AuditService request scope
      await this.audit.recordDbChange({
        action: params.action,
        model,
        recordId: recordId ?? (result?.id as string | undefined),
        before,
        after,
      });

      return result;
    });

    await this.$connect();
    await this.ensureSingletons();
  }



  private async ensureSingletons() {
    // Ensure CensusSettings singleton
    const existing = await this.censusSettings.findUnique({ where: { id: 'singleton' } });
    if (!existing) {
      await this.censusSettings.create({
        data: { id: 'singleton', data: {} },
      });
    }
  }
}
