import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuardOptional } from '../auth/auth.guard';
import { CreateSmtpConfigDto, UpdateSmtpConfigDto } from './dto';
import { SmtpConfigsService } from './smtp-configs.service';

@ApiTags('smtp-configs')
@Controller('smtp-configs')
@UseGuards(AuthGuardOptional)
export class SmtpConfigsController {
  constructor(private readonly service: SmtpConfigsService) {}

  @ApiBearerAuth()
  @Get()
  list() {
    return this.service.list();
  }

  @ApiBearerAuth()
  @Post()
  create(@Body() dto: CreateSmtpConfigDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSmtpConfigDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { ok: true };
  }
}
