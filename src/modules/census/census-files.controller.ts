import { Body, Controller, Delete, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuardOptional } from '../auth/auth.guard';
import { Response } from 'express';
import { UploadCensusFileDto } from './dto';
import { CensusService } from './census.service';

@ApiTags('census-files')
@Controller('census-files')
@UseGuards(AuthGuardOptional)
export class CensusFilesController {
  constructor(private readonly service: CensusService) {}

  @ApiBearerAuth()
  @Get()
  list() {
    return this.service.listFiles();
  }

  @ApiBearerAuth()
  @Post()
  upload(@Body() dto: UploadCensusFileDto) {
    return this.service.uploadFile(dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.removeFile(id);
  }

  @ApiBearerAuth()
  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const file = await this.service.downloadFile(id);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.send(file.buffer);
  }
}
