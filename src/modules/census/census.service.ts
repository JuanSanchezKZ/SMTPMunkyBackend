import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class CensusService {

  constructor(private readonly prisma: PrismaService) {}

  async listFiles() {
    const rows = await this.prisma.censusFile.findMany({ orderBy: { createdAt: 'desc' } });
    
    return rows.map((r) => {

  return {
    id: r.id,
    name: r.name,
    size: r.size,
    type: r.type, 
    uploadDate: r.uploadDate ? r.uploadDate : r.createdAt.getTime(),
    file: r.file,
  };
})};

async uploadFile(dto: any, file: Express.Multer.File) {
  // ✅ 1. Validamos el argumento 'file', NO 'dto.file'
  if (!file) throw new BadRequestException('El archivo binario es requerido');

  // ✅ 2. Usamos file.buffer para Prisma
  const created = await this.prisma.censusFile.create({
    data: { 
      id: randomUUID(), 
      name: dto.name, 
      type: dto.type, 
      size: Number(dto.size), // Aseguramos que sea número si el DTO falló en transformar
      file: file.buffer,      // El binario real
      uploadDate: new Date(Number(dto.uploadDate)).getTime(), // Prisma suele pedir DateTime
      storagePath: 'db_stored' 
    },
  });

  console.log(created)

  // ✅ 3. Retornamos el objeto para que el Frontend lo reciba
  return { 
    id: created.id, 
    name: created.name, 
    size: created.size, 
    type: created.type, 
    uploadDate: created.uploadDate, 
    // Mantenemos 'content' para que el front no rompa, pero mandamos el base64 de vuelta
    content: `data:${created.type};base64,${file.buffer.toString('base64')}` 
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
    
    
    return { fileName: row.name, mimeType: row.type, buffer: row.file };
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