import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(createTicketDto: CreateSupportTicketDto) {
    const ticketId = randomUUID();
    
    const ticket = await this.prisma.supportTicket.create({
      data: {
        id: ticketId,
        fullName: createTicketDto.fullName,
        email: createTicketDto.email,
        subject: createTicketDto.subject,
        message: createTicketDto.message,
        category: createTicketDto.category || 'general',
        priority: createTicketDto.priority || 'medium',
        status: 'open',
      },
    });

    // Send email notification to support team
    await this.sendSupportEmail(ticket);

    return {
      success: true,
      ticketId: ticket.id,
      message: 'Support ticket created successfully. We\'ll get back to you within 24 hours.',
    };
  }

  async getUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getTicket(ticketId: string, userId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId && ticket.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return ticket;
  }

  async addReply(ticketId: string, userId: string, message: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId && ticket.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const reply = await this.prisma.supportReply.create({
      data: {
        ticketId,
        userId,
        message,
        isFromUser: true,
      },
    });

    // Update ticket status to 'waiting_for_support'
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'waiting_for_support' },
    });

    return reply;
  }

  private async sendSupportEmail(ticket: any) {
    // This would integrate with your email service
    // For now, we'll just log it
    console.log('Support ticket created:', {
      ticketId: ticket.id,
      email: ticket.email,
      subject: ticket.subject,
      message: ticket.message,
    });
    
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // Send email to contact@workflowguard.pro
  }
} 