import { Module } from '@nestjs/common';
import { CensusFilesController } from './census-files.controller';
import { CensusSettingsController } from './census-settings.controller';
import { CensusService } from './census.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    PrismaModule,   // Seguramente ya lo tenés
    UploadsModule,  // <-- REQUISITO 2: Importá el módulo completo aquí
  ],
  controllers: [CensusFilesController, CensusSettingsController],
  providers: [CensusService],
})
export class CensusModule {}
