import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuardOptional } from '../auth/auth.guard';

@ApiTags('history')
@Controller('history')
@UseGuards(AuthGuardOptional)
export class HistoryController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiBearerAuth()
  @Get()
  async list(@Query('take') take = '200') {
    const t = Math.min(parseInt(take, 10) || 200, 500);
    const rows = await this.prisma.emailMessage.findMany({ orderBy: { createdAt: 'desc' }, take: t });
    // match frontend shape (timestamp)
    return rows.map((r) => ({
      id: r.id,
      to: r.to,
      cc: r.cc,
      subject: r.subject,
      body: r.body,
      attachments: r.attachments,
      category: r.category,
      timestamp: r.createdAt.getTime(),
      status: r.status === 'SENT' ? 'sent' : 'failed',
      smtpProfileName: r.smtpProfileName,
    }));
  }
}
