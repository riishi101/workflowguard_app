import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [WorkflowModule],
  controllers: [DashboardController],
})
export class DashboardModule {} 