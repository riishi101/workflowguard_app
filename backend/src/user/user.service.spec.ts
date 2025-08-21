import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            plan: {
              findUnique: jest.fn(),
            },
            overage: {
              findMany: jest.fn(),
              create: jest.fn(),
            },
            apiKey: {
              findMany: jest.fn(),
              create: jest.fn(),
              updateMany: jest.fn(),
            },
            subscription: {
              findFirst: jest.fn(),
              create: jest.fn(),
              updateMany: jest.fn(),
              update: jest.fn(),
            },
            workflow: {
              count: jest.fn(),
            },
            notificationSettings: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
