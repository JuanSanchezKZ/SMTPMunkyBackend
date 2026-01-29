import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { SmtpConfigsModule } from './smtp-configs/smtp-configs.module';
import { ContactsModule } from './contacts/contacts.module';
import { TemplatesModule } from './templates/templates.module';
import { CensusModule } from './census/census.module';
import { MailModule } from './mail/mail.module';
import { HistoryModule } from './history/history.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    AuthModule,
    HealthModule,
    UploadsModule,
    SmtpConfigsModule,
    ContactsModule,
    TemplatesModule,
    CensusModule,
    MailModule,
    HistoryModule,
    ReportsModule,
  ],
})
export class AppModule {}
