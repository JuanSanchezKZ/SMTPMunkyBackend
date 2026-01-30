import { Body, Controller, Delete, Get, Param, Post, Res, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // ✅ Necesario para Multipart
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
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
  @UseInterceptors(FileInterceptor('file')) // ✅ Intercepta el campo 'file' del FormData
  @ApiConsumes('multipart/form-data')       // ✅ Informa a Swagger el tipo de contenido
  upload(
    @Body() dto: UploadCensusFileDto, 
    @UploadedFile() file: Express.Multer.File // ✅ Decorador correcto para extraer el archivo
  ) {
    // Si usaste class-transformer en el DTO, aquí 'dto.size' ya será un number
    return this.service.uploadFile(dto, file);
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
    // Asegurate de que el service devuelva estos campos
    res.setHeader('Content-Type', file.mimeType); 
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.send(file.buffer); // 'file' es el Buffer de Prisma (Bytes)
  }
}