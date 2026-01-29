import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto, UpdateContactDto } from './dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.contact.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  create(dto: CreateContactDto) {
    return this.prisma.contact.create({
      data: { id: dto.id, name: dto.name, emails: dto.emails },
    });
  }

  update(id: string, dto: UpdateContactDto) {
    return this.prisma.contact.update({
      where: { id },
      data: { id: dto.id, name: dto.name, emails: dto.emails },
    });
  }

  async remove(id: string) {
    await this.prisma.contact.delete({ where: { id } });
  }
}
