import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  const prisma = { $queryRaw: jest.fn() } as unknown as PrismaService;
  const controller = new HealthController(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('returns a lightweight liveness response', () => {
    expect(controller.live()).toEqual({ status: 'ok' });
  });

  it('reports ready when PostgreSQL responds', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ ok: 1 }]);

    await expect(controller.ready()).resolves.toEqual({
      status: 'ok',
      database: 'reachable',
    });
  });

  it('returns service unavailable when PostgreSQL cannot be reached', async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('offline'));

    await expect(controller.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
