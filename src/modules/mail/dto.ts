import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EmailAttachmentDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiPropertyOptional()
  @IsOptional()
  size?: number;

  @ApiPropertyOptional({ description: 'Optional label from UI (e.g., "PDF GENERADO")' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Frontend preview URL (ignored by backend)' })
  @IsOptional()
  @IsString()
  previewUrl?: string;

  @ApiPropertyOptional({ description: 'Frontend uses `data` as Data URL (data:<mime>;base64,...) for generated/uploaded files' })
  @IsOptional()
  @IsString()
  data?: string;

  @ApiPropertyOptional({ description: 'Alternative field name (if you prefer). Data URL or base64 content.' })
  @IsOptional()
  @IsString()
  contentBase64?: string;

  @ApiPropertyOptional({ description: 'Server-side file path (advanced). Prefer `data`/`contentBase64`.' })
  @IsOptional()
  @IsString()
  storagePath?: string;
}

export class SendEmailDto {
  @ApiProperty({ description: 'Comma-separated or single email. Multiple recipients are allowed.' })
  @IsString()
  to!: string;

  @ApiProperty({ description: 'CC list' })
  @IsArray()
  cc!: string[];

  @ApiProperty()
  @IsString()
  subject!: string;

  @ApiProperty()
  @IsString()
  body!: string;

  @ApiProperty({ type: [EmailAttachmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAttachmentDto)
  attachments!: EmailAttachmentDto[];

  @ApiPropertyOptional({ description: 'SMTP profile id. If omitted, will use the most recently updated SMTP config.' })
  @IsOptional()
  @IsString()
  smtpId?: string;

  @ApiProperty({ description: 'Email category (free string from frontend)' })
  @IsString()
  category!: string;
}
