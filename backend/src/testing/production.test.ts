import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Production Readiness Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Checks', () => {
    it('should return basic health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });

    it('should return detailed health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks).toHaveProperty('memory');
    });

    it('should return readiness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status');
    });

    it('should return liveness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status');
    });
  });

  describe('Database Connectivity', () => {
    it('should connect to database successfully', async () => {
      const result = await prismaService.$queryRaw`SELECT 1 as test`;
      expect(result).toBeDefined();
    });

    it('should handle database queries within acceptable time', async () => {
      const start = Date.now();
      await prismaService.user.findMany({ take: 1 });
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('strict-transport-security');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(105).fill(null).map(() => 
        request(app.getHttpServer()).get('/api/health')
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('API Endpoints', () => {
    it('should handle invalid routes gracefully', async () => {
      await request(app.getHttpServer())
        .get('/api/nonexistent')
        .expect(404);
    });

    it('should validate request payloads', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ invalid: 'data' })
        .expect(400);
    });

    it('should require authentication for protected routes', async () => {
      await request(app.getHttpServer())
        .get('/api/workflows')
        .expect(401);
    });
  });

  describe('Performance', () => {
    it('should respond to health checks quickly', async () => {
      const start = Date.now();
      await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500); // Should respond within 500ms
    });

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 10;
      const requests = Array(concurrentRequests).fill(null).map(() =>
        request(app.getHttpServer()).get('/api/health')
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should not expose sensitive information in errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.message).not.toContain('stack');
      expect(response.body.message).not.toContain('database');
      expect(response.body.message).not.toContain('password');
    });
  });

  describe('Environment Configuration', () => {
    it('should have required environment variables', () => {
      const requiredVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'HUBSPOT_CLIENT_ID',
        'HUBSPOT_CLIENT_SECRET'
      ];

      requiredVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined();
      });
    });

    it('should be running in appropriate environment', () => {
      expect(['development', 'staging', 'production']).toContain(process.env.NODE_ENV);
    });
  });
});
