import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class PaymentTrackingService {
  private readonly logger = new Logger(PaymentTrackingService.name);

  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService
  ) {}

  /**
   * Create a new payment transaction record
   * This ensures every payment is tracked from creation
   */
  async createPaymentTransaction(data: {
    userId: string;
    planId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    planName: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      const transaction = await this.prisma.paymentTransaction.create({
        data: {
          ...data,
          status: 'pending'
        }
      });

      // Create audit log entry
      await this.auditLogService.createAuditLog({
        userId: data.userId,
        action: 'PAYMENT_INITIATED',
        entityType: 'PaymentTransaction',
        entityId: transaction.id,
        newValue: {
          orderId: data.razorpayOrderId,
          amount: data.amount,
          currency: data.currency,
          planName: data.planName
        },
        ipAddress: data.ipAddress
      });

      this.logger.log(`✅ Payment transaction created: ${transaction.id} for user ${data.userId}`);
      return transaction;
    } catch (error) {
      this.logger.error(`❌ Failed to create payment transaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update payment transaction on successful payment
   */
  async markPaymentSuccess(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    paymentMethod?: string;
    cardLast4?: string;
    cardNetwork?: string;
    bankName?: string;
  }) {
    try {
      const transaction = await this.prisma.paymentTransaction.update({
        where: { razorpayOrderId: data.razorpayOrderId },
        data: {
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature,
          status: 'success',
          paidAt: new Date(),
          paymentMethod: data.paymentMethod,
          cardLast4: data.cardLast4,
          cardNetwork: data.cardNetwork,
          bankName: data.bankName
        }
      });

      // Create audit log entry
      await this.auditLogService.createAuditLog({
        userId: transaction.userId,
        action: 'PAYMENT_SUCCESS',
        entityType: 'PaymentTransaction',
        entityId: transaction.id,
        newValue: {
          paymentId: data.razorpayPaymentId,
          status: 'success',
          paidAt: new Date(),
          paymentMethod: data.paymentMethod
        }
      });

      this.logger.log(`✅ Payment successful: ${transaction.id} - ${data.razorpayPaymentId}`);
      return transaction;
    } catch (error) {
      this.logger.error(`❌ Failed to mark payment success: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update payment transaction on failed payment
   */
  async markPaymentFailed(data: {
    razorpayOrderId: string;
    errorCode?: string;
    errorDescription?: string;
  }) {
    try {
      const transaction = await this.prisma.paymentTransaction.update({
        where: { razorpayOrderId: data.razorpayOrderId },
        data: {
          status: 'failed',
          failedAt: new Date(),
          errorCode: data.errorCode,
          errorDescription: data.errorDescription
        }
      });

      // Create audit log entry
      await this.auditLogService.createAuditLog({
        userId: transaction.userId,
        action: 'PAYMENT_FAILED',
        entityType: 'PaymentTransaction',
        entityId: transaction.id,
        newValue: {
          status: 'failed',
          failedAt: new Date(),
          errorCode: data.errorCode,
          errorDescription: data.errorDescription
        }
      });

      this.logger.warn(`⚠️ Payment failed: ${transaction.id} - ${data.errorCode}`);
      return transaction;
    } catch (error) {
      this.logger.error(`❌ Failed to mark payment failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get payment history for a user
   */
  async getUserPaymentHistory(userId: string, limit = 50, offset = 0) {
    try {
      const transactions = await this.prisma.paymentTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
          amount: true,
          currency: true,
          status: true,
          planName: true,
          paymentMethod: true,
          cardLast4: true,
          cardNetwork: true,
          createdAt: true,
          paidAt: true,
          failedAt: true
        }
      });

      this.logger.log(`📊 Retrieved ${transactions.length} payment records for user ${userId}`);
      return transactions;
    } catch (error) {
      this.logger.error(`❌ Failed to get payment history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get payment analytics for admin dashboard
   */
  async getPaymentAnalytics(startDate?: Date, endDate?: Date) {
    try {
      const whereClause = startDate && endDate ? {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      } : {};

      const [totalTransactions, successfulPayments, failedPayments, totalRevenue] = await Promise.all([
        this.prisma.paymentTransaction.count({ where: whereClause }),
        this.prisma.paymentTransaction.count({ 
          where: { ...whereClause, status: 'success' } 
        }),
        this.prisma.paymentTransaction.count({ 
          where: { ...whereClause, status: 'failed' } 
        }),
        this.prisma.paymentTransaction.aggregate({
          where: { ...whereClause, status: 'success' },
          _sum: { amount: true }
        })
      ]);

      const analytics = {
        totalTransactions,
        successfulPayments,
        failedPayments,
        successRate: totalTransactions > 0 ? (successfulPayments / totalTransactions) * 100 : 0,
        totalRevenue: totalRevenue._sum.amount || 0
      };

      this.logger.log(`📈 Payment analytics: ${successfulPayments}/${totalTransactions} successful`);
      return analytics;
    } catch (error) {
      this.logger.error(`❌ Failed to get payment analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get transaction by Razorpay order ID
   */
  async getTransactionByOrderId(razorpayOrderId: string) {
    try {
      const transaction = await this.prisma.paymentTransaction.findUnique({
        where: { razorpayOrderId },
        include: { user: { select: { id: true, email: true, name: true } } }
      });

      if (transaction) {
        this.logger.log(`🔍 Found transaction: ${transaction.id} for order ${razorpayOrderId}`);
      }

      return transaction;
    } catch (error) {
      this.logger.error(`❌ Failed to get transaction by order ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create refund record
   */
  async createRefund(data: {
    paymentTransactionId: string;
    razorpayRefundId: string;
    amount: number;
    currency: string;
    reason?: string;
    notes?: string;
  }) {
    try {
      const refund = await this.prisma.paymentRefund.create({
        data: {
          ...data,
          status: 'pending'
        }
      });

      // Update original transaction
      await this.prisma.paymentTransaction.update({
        where: { id: data.paymentTransactionId },
        data: {
          status: 'refunded',
          refundedAt: new Date()
        }
      });

      // Create audit log
      const transaction = await this.prisma.paymentTransaction.findUnique({
        where: { id: data.paymentTransactionId }
      });

      if (transaction) {
        await this.auditLogService.createAuditLog({
          userId: transaction.userId,
          action: 'PAYMENT_REFUNDED',
          entityType: 'PaymentRefund',
          entityId: refund.id,
          newValue: {
            refundId: data.razorpayRefundId,
            amount: data.amount,
            reason: data.reason
          }
        });
      }

      this.logger.log(`💰 Refund created: ${refund.id} for transaction ${data.paymentTransactionId}`);
      return refund;
    } catch (error) {
      this.logger.error(`❌ Failed to create refund: ${error.message}`);
      throw error;
    }
  }
}
