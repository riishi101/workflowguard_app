import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const timestamp = new Date().toISOString();
    const requestId = Math.random().toString(36).substring(2, 15);
    
    // Log ALL requests to compare endpoints
    if (req.url.includes('/compare/')) {
      console.log('🌐 MIDDLEWARE: Compare request intercepted!');
      console.log('🔍 MIDDLEWARE: Request ID:', requestId);
      console.log('🔍 MIDDLEWARE: Method:', req.method);
      console.log('🔍 MIDDLEWARE: URL:', req.url);
      console.log('🔍 MIDDLEWARE: Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
      console.log('🔍 MIDDLEWARE: Headers:', JSON.stringify(req.headers, null, 2));
      console.log('🔍 MIDDLEWARE: Timestamp:', timestamp);
      console.log('🔍 MIDDLEWARE: User-Agent:', req.get('User-Agent'));
      console.log('🔍 MIDDLEWARE: Origin:', req.get('Origin'));
      
      // Add request ID to request object
      (req as any).requestId = requestId;
    }
    
    next();
  }
}
