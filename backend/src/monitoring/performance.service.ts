import { Injectable } from '@nestjs/common';
import { logger } from '../config/logger.config';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000; // Keep last 1000 metrics in memory

  /**
   * Start timing an operation
   */
  startTimer(name: string): () => void {
    const start = Date.now();
    
    return (metadata?: Record<string, any>) => {
      const duration = Date.now() - start;
      this.recordMetric(name, duration, metadata);
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, duration: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date(),
      metadata
    };

    // Add to in-memory store
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log slow operations
    if (duration > 1000) { // > 1 second
      logger.warn('Slow operation detected', {
        operation: name,
        duration: `${duration}ms`,
        metadata
      });
    }

    // Log all database operations
    if (name.includes('database') || name.includes('prisma')) {
      logger.info('Database operation', {
        operation: name,
        duration: `${duration}ms`,
        metadata
      });
    }
  }

  /**
   * Get performance statistics
   */
  getStats(operationName?: string): any {
    const filteredMetrics = operationName 
      ? this.metrics.filter(m => m.name === operationName)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0 };
    }

    const durations = filteredMetrics.map(m => m.duration);
    const sum = durations.reduce((a, b) => a + b, 0);
    
    return {
      count: filteredMetrics.length,
      average: Math.round(sum / filteredMetrics.length),
      min: Math.min(...durations),
      max: Math.max(...durations),
      p95: this.percentile(durations, 95),
      p99: this.percentile(durations, 99),
      recent: filteredMetrics.slice(-10).map(m => ({
        duration: m.duration,
        timestamp: m.timestamp
      }))
    };
  }

  /**
   * Get all operation names
   */
  getOperationNames(): string[] {
    const names = new Set(this.metrics.map(m => m.name));
    return Array.from(names).sort();
  }

  /**
   * Clear metrics (useful for testing)
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Calculate percentile
   */
  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Decorator for timing methods
   */
  static timed(operationName?: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value;
      const name = operationName || `${target.constructor.name}.${propertyName}`;

      descriptor.value = async function (...args: any[]) {
        const performanceService = new PerformanceService();
        const endTimer = performanceService.startTimer(name);
        
        try {
          const result = await method.apply(this, args);
          endTimer({ success: true });
          return result;
        } catch (error) {
          endTimer({ success: false, error: error.message });
          throw error;
        }
      };
    };
  }
}

/**
 * Performance monitoring middleware
 */
export function performanceMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  const performanceService = new PerformanceService();

  res.on('finish', () => {
    const duration = Date.now() - start;
    performanceService.recordMetric('http_request', duration, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      userAgent: req.headers['user-agent']
    });
  });

  next();
}
