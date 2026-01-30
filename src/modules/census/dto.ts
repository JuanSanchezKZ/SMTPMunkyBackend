import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {IsInt,IsOptional,IsString} from 'class-validator';

export class UploadCensusFileDto {
  @ApiProperty()
  @IsString()
  @IsOptional() 
  id?: string;

  @ApiProperty()
  @IsInt()
  uploadDate!: number;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  type!: string;
 
  @ApiProperty()
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
