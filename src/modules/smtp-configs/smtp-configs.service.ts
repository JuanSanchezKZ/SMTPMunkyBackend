import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSmtpConfigDto, UpdateSmtpConfigDto } from './dto';
import { decryptString, encryptString } from '../../common/crypto.util';

@Injectable()
export class SmtpConfigsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.smtpConfig.findMany({ orderBy: { updatedAt: 'desc' } });
    return rows.map((r) => ({
      ...r,
      password: undefined, // do not expose by default
      hasPassword: !!r.passwordEnc,
    }));
  }

  async create(dto: CreateSmtpConfigDto) {
    const created = await this.prisma.smtpConfig.create({
      data: {
        id: dto.id,
        name: dto.name,
        host: dto.host,
        port: dto.port,
        secure: dto.secure,
        username: dto.username,
        passwordEnc: dto.password ? encryptString(dto.password) : null,
      },
    });
    return { ...created, password: undefined, hasPassword: !!created.passwordEnc };
  }

  async update(id: string, dto: UpdateSmtpConfigDto) {
    const updated = await this.prisma.smtpConfig.update({
      where: { id },
      data: {
        id: dto.id,
        name: dto.name,
        host: dto.host,
        port: dto.port,
        secure: dto.secure,
        username: dto.username,
        ...(dto.password !== undefined ? { passwordEnc: dto.password ? encryptString(dto.password) : null } : {}),
      },
    });
    return { ...updated, password: undefined, hasPassword: !!updated.passwordEnc };
  }

  async remove(id: string) {
    await this.prisma.smtpConfig.delete({ where: { id } });
  }

  async getDecryptedPassword(id: string): Promise<string | null> {
    const row = await this.prisma.smtpConfig.findUnique({ where: { id } });
    if (!row?.passwordEnc) return null;
    return decryptString(row.passwordEnc);
  }
}
