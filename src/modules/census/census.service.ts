import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CensusService {
  // Ya no necesitamos inyectar UploadsService si guardamos todo en la DB
  constructor(private readonly prisma: PrismaService) {}

  async listFiles() {
    const rows = await this.prisma.censusFile.findMany({ orderBy: { createdAt: 'desc' } });
    
    // El mapeo es mucho más rápido porque no hay E/S de disco (fs)
    return rows.map((r) => {
      // r.content es un Buffer en Prisma cuando el campo es Bytes
      const base64 = r.content.toString('base64');
      return {
        id: r.id,
        name: r.name,
        size: r.size,
        type: r.type,
        uploadDate: r.uploadDate ?? r.createdAt.getTime(),
        content: `data:${r.type};base64,${base64}`,
      };
    });
  }

  async uploadFile(dto: any) {
    if (!dto.content) throw new BadRequestException('Content is required for DB storage');

    // Procesamos el base64 a Buffer
    const base64Data = dto.content.includes(',') ? dto.content.split(',')[1] : dto.content;
    const buf = Buffer.from(base64Data, 'base64');

    const created = await this.prisma.censusFile.create({
      data: { 
        id: dto.id, 
        name: dto.name, 
        type: dto.type, 
        size:dto.size, 
        content: buf, // 👈 Guardamos el binario en Postgres
        uploadDate: dto.uploadDate,
        storagePath: 'db_stored' // Solo como referencia
      },
    });

    return { 
      id: created.id, 
      name: created.name, 
      size: created.size, 
      type: created.type, 
      uploadDate: created.uploadDate, 
      content: dto.content 
    };
  }

  async removeFile(id: string) {
    const row = await this.prisma.censusFile.findUnique({ where: { id } });
    if (!row) throw new NotFoundException();
    await this.prisma.censusFile.delete({ where: { id } });
    return { ok: true };
  }

  async downloadFile(id: string): Promise<{ fileName: string; mimeType: string; buffer: Buffer }> {
    const row = await this.prisma.censusFile.findUnique({ where: { id } });
    if (!row) throw new NotFoundException();
    
    // Leemos directamente de la columna content (Bytes)
    return { fileName: row.name, mimeType: row.type, buffer: row.content };
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