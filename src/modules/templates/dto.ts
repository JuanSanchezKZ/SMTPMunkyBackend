import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  subject!: string;

  @ApiProperty()
  @IsString()
  body!: string;
}

export class UpdateTemplateDto extends CreateTemplateDto {}
