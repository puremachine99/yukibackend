import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany();
  }

  async create(data: any) {
    if (!data.name || !data.email || !data.password || !data.phoneNumber) {
      throw new Error('❌ Missing required fields');
    }
    return this.prisma.user.create({ data });
  }
}
