import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.template.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  create(dto: CreateTemplateDto) {
    return this.prisma.template.create({ data: dto });
  }

  update(id: string, dto: UpdateTemplateDto) {
    return this.prisma.template.update({ where: { id }, data: { name: dto.name, subject: dto.subject, body: dto.body } });
  }

  async remove(id: string) {
    await this.prisma.template.delete({ where: { id } });
  }
}
