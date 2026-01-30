import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {IsInt,IsOptional,IsString} from 'class-validator';

export class UploadCensusFileDto {
  @ApiProperty()
  @IsString()
  @IsOptional() 
  id?: string;

  @Type(() => Number) // ✅ Convierte el timestamp string a number
  @IsInt()
  uploadDate!: number;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  type!: string;
 
  @Type(() => Number) // ✅ Convierte el string "1024" a number 1024
  @IsInt()
  size!: number;

  @ApiPropertyOptional({
    description:
      'Data URL (data:<mime>;base64,...) or raw base64 string. If omitted, use multipart /uploads and then create with storagePath.',
  })

  @ApiPropertyOptional({ description: 'Server-side path (advanced use). Prefer content or /uploads.' })
  @IsOptional()
  @IsString()
  storagePath?: string;
}
