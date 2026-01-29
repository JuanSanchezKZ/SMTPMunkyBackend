import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuardOptional } from '../auth/auth.guard';
import { UploadsService } from './uploads.service';
import * as multer from 'multer';

@ApiTags('uploads')
@Controller('uploads')
@UseGuards(AuthGuardOptional)
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @ApiBearerAuth()
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: parseInt(process.env.MAX_UPLOAD_MB || '15', 10) * 1024 * 1024 },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.uploads.saveBuffer(file.originalname, file.mimetype, file.buffer);
  }
}
