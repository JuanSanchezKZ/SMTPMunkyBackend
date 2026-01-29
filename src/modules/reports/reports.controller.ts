import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { AuthGuardOptional } from '../auth/auth.guard';
import { ReportsService } from './reports.service';

function parseDate(v?: string): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuardOptional)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @ApiBearerAuth()
  @Get('email-activity')
  async emailActivityJson(@Query('from') from?: string, @Query('to') to?: string) {
    return this.service.emailActivity(parseDate(from), parseDate(to));
  }

  @ApiBearerAuth()
  @Get('email-activity.xlsx')
  async emailActivityXlsx(@Query('from') from: string, @Query('to') to: string, @Res() res: Response) {
    const report = await this.service.emailActivity(parseDate(from), parseDate(to));
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Email Activity');
    ws.addRow(['From', report.from?.toISOString() ?? '', 'To', report.to?.toISOString() ?? '']);
    ws.addRow([]);
    ws.addRow(['Total', report.total, 'Sent', report.sent, 'Failed', report.failed]);
    ws.addRow([]);
    ws.addRow(['Category', 'Count']);
    Object.entries(report.byCategory).forEach(([k, v]) => ws.addRow([k, v]));
    ws.addRow([]);
    ws.addRow(['CreatedAt', 'To', 'CC', 'Subject', 'Status', 'Category', 'SMTP Profile']);
    report.messages.forEach((m) => {
      ws.addRow([
        m.createdAt.toISOString(),
        m.to,
        JSON.stringify(m.cc),
        m.subject,
        m.status,
        m.category,
        m.smtpProfileName ?? '',
      ]);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="email-activity.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  }

  @ApiBearerAuth()
  @Get('email-activity.pdf')
  async emailActivityPdf(@Query('from') from: string, @Query('to') to: string, @Res() res: Response) {
    const report = await this.service.emailActivity(parseDate(from), parseDate(to));
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="email-activity.pdf"');
    doc.pipe(res);

    doc.fontSize(18).text('Email Activity Report', { underline: true });
    doc.moveDown();
    doc.fontSize(11).text(`Range: ${report.from?.toISOString() ?? '-'} to ${report.to?.toISOString() ?? '-'}`);
    doc.text(`Total: ${report.total} | Sent: ${report.sent} | Failed: ${report.failed}`);
    doc.moveDown();

    doc.fontSize(12).text('By Category', { underline: true });
    Object.entries(report.byCategory).forEach(([k, v]) => doc.fontSize(10).text(`- ${k}: ${v}`));
    doc.moveDown();

    doc.fontSize(12).text('Latest Messages (up to 100)', { underline: true });
    doc.moveDown(0.5);
    report.messages.slice(0, 100).forEach((m) => {
      doc.fontSize(9).text(`${m.createdAt.toISOString()} | ${m.status} | ${m.category} | ${m.to} | ${m.subject}`);
    });

    doc.end();
  }

  @ApiBearerAuth()
  @Get('audit-summary')
  async auditSummaryJson(@Query('from') from?: string, @Query('to') to?: string) {
    return this.service.auditSummary(parseDate(from), parseDate(to));
  }

  @ApiBearerAuth()
  @Get('audit-summary.xlsx')
  async auditSummaryXlsx(@Query('from') from: string, @Query('to') to: string, @Res() res: Response) {
    const report = await this.service.auditSummary(parseDate(from), parseDate(to));
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Audit Summary');
    ws.addRow(['From', report.from?.toISOString() ?? '', 'To', report.to?.toISOString() ?? '']);
    ws.addRow([]);
    ws.addRow(['Total', report.total]);
    ws.addRow([]);
    ws.addRow(['Model', 'Count']);
    Object.entries(report.byModel).forEach(([k, v]) => ws.addRow([k, v]));
    ws.addRow([]);
    ws.addRow(['CreatedAt', 'ActorId', 'Action', 'Model', 'RecordId']);
    report.logs.forEach((l) => ws.addRow([l.createdAt.toISOString(), l.actorId ?? '', l.action, l.model, l.recordId ?? '']));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-summary.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  }
}
