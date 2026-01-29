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
  // Middleware para auditoría en operaciones de escritura
  this.$use(async (params, next) => {
    const auditedModels = new Set(['SmtpConfig', 'Contact', 'Template', 'CensusFile', 'CensusSettings', 'EmailMessage', 'User']);
    const isWrite = ['create', 'update', 'upsert', 'delete', 'deleteMany', 'updateMany', 'createMany'].includes(params.action);

    if (!auditedModels.has(params.model ?? '') || !isWrite) {
      return next(params);
    }

    const model = params.model!;
    // Normalización vital: "CensusSettings" -> "censusSettings"
    // Esto evita el error 'undefined (reading findUnique)'
    const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
    
    let before: any = null;
    const recordId =
      (params.args?.where?.id as string | undefined) ||
      (params.args?.where?.['id'] as string | undefined) ||
      null;

      const dynamicThis = this as any;

    // Leer estado "antes" para operaciones sobre registros únicos
    if (recordId && ['update', 'delete', 'upsert'].includes(params.action)) {
      try {
       
        if (dynamicThis[modelKey]) {
          before = await dynamicThis[modelKey].findUnique({ where: { id: recordId } });
        }
      } catch (e) {
        console.warn(`No se pudo leer el estado previo de ${modelKey}`);
      }
    }

    const result = await next(params);

    // Leer estado "después" si es necesario
    let after: any = null;
    if (recordId && ['update', 'upsert'].includes(params.action)) {
      try {
        // @ts-expect-error dynamic model access
        after = await this[modelKey].findUnique({ where: { id: recordId } });
      } catch (e) {
        console.warn(`No se pudo leer el estado posterior de ${modelKey}`);
      }
    } else if (params.action === 'create') {
      after = result;
    } else if (params.action === 'delete') {
      before = before ?? result;
    }

    // El actor se adjunta en el request scope del AuditService
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
  
  // Inicialización de registros fijos (Singletons)
  await this.ensureSingletons();
}

private async ensureSingletons() {
  try {
    // Aseguramos que exista la configuración de censo por defecto
    await this.censusSettings.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { 
        id: 'singleton', 
        data: {} 
      },
    });
  } catch (error) {
    // Evita que la app muera si las tablas aún no se crearon en Railway
    console.error("Error inicializando singletons (posiblemente falta migración):", error);
  }
}
}
