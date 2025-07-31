import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HubSpotController } from '../controllers/hubspot.controller';
import { HubSpotService } from '../services/hubspot.service';
import { HubSpotHealthService } from '../services/hubspot-health.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    AuthModule,
    PrismaModule,
    WorkflowModule,
  ],
  controllers: [HubSpotController],
  providers: [HubSpotService, HubSpotHealthService],
  exports: [HubSpotService, HubSpotHealthService],
})
export class HubSpotModule {} 