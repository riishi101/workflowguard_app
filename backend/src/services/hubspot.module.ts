import { Module } from '@nestjs/common';
import { HubSpotService } from './hubspot.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [HubSpotService],
  exports: [HubSpotService],
})
export class HubSpotModule {}
