import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuardOptional } from '../auth/auth.guard';
import { CreateTemplateDto, UpdateTemplateDto } from './dto';
import { TemplatesService } from './templates.service';

@ApiTags('templates')
@Controller('templates')
@UseGuards(AuthGuardOptional)
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @ApiBearerAuth()
  @Get()
  list() {
    return this.service.list();
  }

  @ApiBearerAuth()
  @Post()
  create(@Body() dto: CreateTemplateDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { ok: true };
  }
}
