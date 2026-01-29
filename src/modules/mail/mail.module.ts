import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SmtpConfigsModule } from '../smtp-configs/smtp-configs.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    PrismaModule,   // Seguramente ya lo tenés
    UploadsModule,
    SmtpConfigsModule
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
