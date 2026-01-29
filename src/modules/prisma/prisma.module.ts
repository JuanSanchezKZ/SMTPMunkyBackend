import { forwardRef, Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [forwardRef(() => PrismaModule)],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
