import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuardOptional } from '../auth/auth.guard';

@ApiTags('audit')
@Controller('audit')
@UseGuards(AuthGuardOptional)
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiBearerAuth()
  @Get()
  async list(
    @Query('model') model?: string,
    @Query('recordId') recordId?: string,
    @Query('take') take = '100',
  ) {
    const t = Math.min(parseInt(take, 10) || 100, 500);
    return this.prisma.auditLog.findMany({
      where: {
        ...(model ? { model } : {}),
        ...(recordId ? { recordId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: t,
    });
  }
}
