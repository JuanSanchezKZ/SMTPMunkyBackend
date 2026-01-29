import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { UploadCensusFileDto } from './dto';

@Injectable()
export class CensusService {
  constructor(private readonly prisma: PrismaService, private readonly uploads: UploadsService) {}

  async listFiles() {
  const rows = await this.prisma.censusFile.findMany({ orderBy: { createdAt: 'desc' } });
  // Frontend expects `content` (Data URL) and `uploadDate` (number)
  return Promise.all(
    rows.map(async (r) => {
      const buf = await this.uploads.readByPath(r.storagePath);
      const base64 = buf.toString('base64');
      const dataUrl = `data:${r.type};base64,${base64}`;
      return {
        id: r.id,
        name: r.name,
        size: r.size,
        type: r.type,
        uploadDate: r.uploadDate ?? r.createdAt.getTime(),
        content: dataUrl,
      };
    }),
  );
}


  async uploadFile(dto: UploadCensusFileDto) {
    let storagePath = dto.storagePath;

    if (!storagePath) {
      if (!dto.content) throw new BadRequestException('content or storagePath is required');
      const base64 = dto.content.includes(',') ? dto.content.split(',')[1] : dto.content;
      const buf = Buffer.from(base64, 'base64');
      const saved = await this.uploads.saveBuffer(dto.name, dto.type, buf);
      storagePath = saved.path;
    }

    const created = await this.prisma.censusFile.create({
      data: { id: dto.id, name: dto.name, type: dto.type, size: dto.size, storagePath: storagePath!, uploadDate: dto.uploadDate },
    });
    // Return frontend shape including content
    const buf = await this.uploads.readByPath(created.storagePath);
    const base64 = buf.toString('base64');
    return { id: created.id, name: created.name, size: created.size, type: created.type, uploadDate: created.uploadDate, content: `data:${created.type};base64,${base64}` };
  }

  async removeFile(id: string) {
    const row = await this.prisma.censusFile.findUnique({ where: { id } });
    if (!row) throw new NotFoundException();
    await this.prisma.censusFile.delete({ where: { id } });
    // Optional: delete file from disk (keep for audit/debug)
    return { ok: true };
  }

  async downloadFile(id: string): Promise<{ fileName: string; mimeType: string; buffer: Buffer }> {
    const row = await this.prisma.censusFile.findUnique({ where: { id } });
    if (!row) throw new NotFoundException();
    const buf = await this.uploads.readByPath(row.storagePath);
    return { fileName: row.name, mimeType: row.type, buffer: buf };
  }

  async getSettings() {
  const row = await this.prisma.censusSettings.findUnique({ where: { id: 'singleton' } });
  return row?.data ?? {};
}

async updateSettings(settings: Record<string, any>) {
  const row = await this.prisma.censusSettings.update({
    where: { id: 'singleton' },
    data: { data: settings },
  });
  return row.data;
}
}
