import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  async createTicket(@Body() createTicketDto: CreateSupportTicketDto) {
    return this.supportService.createTicket(createTicketDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets')
  async getUserTickets(@Request() req: any) {
    return this.supportService.getUserTickets(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets/:id')
  async getTicket(@Param('id') id: string, @Request() req: any) {
    return this.supportService.getTicket(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('tickets/:id/reply')
  async addReply(
    @Param('id') id: string,
    @Body() replyData: { message: string },
    @Request() req: any
  ) {
    return this.supportService.addReply(id, req.user.id, replyData.message);
  }
} 