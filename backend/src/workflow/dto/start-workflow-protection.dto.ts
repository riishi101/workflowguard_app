import { IsArray, IsString, IsOptional } from 'class-validator';

export class StartWorkflowProtectionDto {
  @IsArray()
  @IsString({ each: true })
  workflowIds: string[];

  @IsOptional()
  @IsString()
  userId?: string;
} 