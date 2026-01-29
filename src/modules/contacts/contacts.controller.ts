import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuardOptional } from '../auth/auth.guard';
import { CreateContactDto, UpdateContactDto } from './dto';
import { ContactsService } from './contacts.service';

@ApiTags('contacts')
@Controller('contacts')
@UseGuards(AuthGuardOptional)
export class ContactsController {
  constructor(private readonly service: ContactsService) {}

  @ApiBearerAuth()
  @Get()
  list() {
    return this.service.list();
  }

  @ApiBearerAuth()
  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { ok: true };
  }
}
