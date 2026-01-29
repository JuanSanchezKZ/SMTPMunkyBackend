import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSmtpConfigDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  host!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(65535)
  port!: number;

  @ApiProperty()
  @IsBoolean()
  secure!: boolean;

  @ApiProperty()
  @IsString()
  username!: string;

  @ApiPropertyOptional({ description: 'Stored encrypted at rest.' })
  @IsOptional()
  @IsString()
  password?: string;
}

export class UpdateSmtpConfigDto extends CreateSmtpConfigDto {}
