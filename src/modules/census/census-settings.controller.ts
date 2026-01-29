import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuardOptional } from '../auth/auth.guard';
import { CensusService } from './census.service';

@ApiTags('census-settings')
@Controller('census-settings')
@UseGuards(AuthGuardOptional)
export class CensusSettingsController {
  constructor(private readonly service: CensusService) {}

  @ApiBearerAuth()
  @Get()
  get() {
    return this.service.getSettings();
  }

  @ApiBearerAuth()
  @Put()
  update(@Body() settings: Record<string, any>) {
    return this.service.updateSettings(settings);
  }
}
