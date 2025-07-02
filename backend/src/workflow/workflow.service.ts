import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Workflow, Prisma } from '@prisma/client';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService, private userService: UserService) {}

  async create(data: CreateWorkflowDto): Promise<Workflow> {
    const { ownerId, ...rest } = data;
    // Fetch user with subscription
    const user = await this.userService.findOneWithSubscription(ownerId);
    if (!user) throw new ForbiddenException('User not found');
    const planId = user.subscription?.planId || 'starter';
    const plan = await this.userService.getPlanById(planId) || await this.userService.getPlanById('starter');
    let count = await this.prisma.workflow.count({ where: { ownerId } });
    let isOverage = false;
    if (plan?.maxWorkflows !== null && plan?.maxWorkflows !== undefined) {
      if (count >= plan.maxWorkflows) {
        isOverage = true;
      }
    }
    const workflow = await this.prisma.workflow.create({
      data: {
        ...rest,
        owner: { connect: { id: ownerId } },
      },
      include: {
        owner: true,
        versions: true,
      },
    });
    if (isOverage) {
      // Record overage for this billing period
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      await this.prisma.overage.upsert({
        where: {
          userId_type_periodStart_periodEnd: {
            userId: ownerId,
            type: 'workflow',
            periodStart,
            periodEnd,
          },
        },
        update: { amount: { increment: 1 } },
        create: {
          userId: ownerId,
          type: 'workflow',
          amount: 1,
          periodStart,
          periodEnd,
        },
      });
    }
    return workflow;
  }

  async findAll(): Promise<Workflow[]> {
    return this.prisma.workflow.findMany({
      include: {
        owner: true,
        versions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  async findOne(id: string): Promise<Workflow | null> {
    return this.prisma.workflow.findUnique({
      where: { id },
      include: {
        owner: true,
        versions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async findByHubspotId(hubspotId: string): Promise<Workflow | null> {
    return this.prisma.workflow.findFirst({
      where: { hubspotId },
      include: {
        owner: true,
        versions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.WorkflowUpdateInput): Promise<Workflow> {
    return this.prisma.workflow.update({
      where: { id },
      data,
      include: {
        owner: true,
        versions: true,
      },
    });
  }

  async remove(id: string): Promise<Workflow> {
    return this.prisma.workflow.delete({
      where: { id },
    });
  }
}
