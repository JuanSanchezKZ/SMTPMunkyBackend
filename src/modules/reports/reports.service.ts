import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async emailActivity(from?: Date, to?: Date) {
    const where: any = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const messages = await this.prisma.emailMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    const total = messages.length;
    const sent = messages.filter((m) => m.status === 'SENT').length;
    const failed = total - sent;

    const byCategory: Record<string, number> = {};
    for (const m of messages) {
      byCategory[m.category] = (byCategory[m.category] ?? 0) + 1;
    }

    return { from, to, total, sent, failed, byCategory, messages };
  }

  async auditSummary(from?: Date, to?: Date) {
    const where: any = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }
    const logs = await this.prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: 5000 });
    const total = logs.length;
    const byModel: Record<string, number> = {};
    for (const l of logs) byModel[l.model] = (byModel[l.model] ?? 0) + 1;
    return { from, to, total, byModel, logs };
  }
}
