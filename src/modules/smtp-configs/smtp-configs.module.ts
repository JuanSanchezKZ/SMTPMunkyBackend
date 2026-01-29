import { Module } from '@nestjs/common';
import { SmtpConfigsController } from './smtp-configs.controller';
import { SmtpConfigsService } from './smtp-configs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SmtpConfigsController],
  providers: [SmtpConfigsService],
  exports: [SmtpConfigsService],
})
export class SmtpConfigsModule {}
