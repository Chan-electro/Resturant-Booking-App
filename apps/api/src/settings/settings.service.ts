import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSettings() {
    return this.prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async getSetting(key: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    return setting;
  }

  async getValue(key: string, defaultValue = ''): Promise<string> {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    return setting?.value ?? defaultValue;
  }

  async updateSetting(key: string, value: string, updatedBy: string) {
    return this.prisma.setting.upsert({
      where: { key },
      create: { key, value, updatedBy },
      update: { value, updatedBy },
    });
  }
}
