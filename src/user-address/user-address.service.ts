import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';

@Injectable()
export class UserAddressService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateUserAddressDto) {
    // enforce one default address
    if (dto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.userAddress.create({
      data: { ...dto, userId },
    });
  }

  async findAll(userId: number) {
    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const address = await this.prisma.userAddress.findUnique({ where: { id } });
    if (!address || address.userId !== userId)
      throw new ForbiddenException('Not your address');
    return address;
  }

  async update(id: number, userId: number, dto: UpdateUserAddressDto) {
    const address = await this.prisma.userAddress.findUnique({ where: { id } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId)
      throw new ForbiddenException('Not your address');

    if (dto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.userAddress.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, userId: number) {
    const address = await this.prisma.userAddress.findUnique({ where: { id } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId)
      throw new ForbiddenException('Not your address');

    return this.prisma.userAddress.delete({ where: { id } });
  }

  async setDefault(id: number, userId: number) {
    const address = await this.prisma.userAddress.findUnique({ where: { id } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId)
      throw new ForbiddenException('Not your address');

    await this.prisma.userAddress.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return this.prisma.userAddress.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
