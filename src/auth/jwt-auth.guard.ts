import {
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedRequestUser } from './decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const canActivate = (await super.canActivate(context)) as boolean;
    if (!canActivate) return false;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedRequestUser }>();
    const user = request.user;
    if (!user?.id) return false;

    const record = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { isBanned: true },
    });

    if (record?.isBanned) {
      throw new ForbiddenException('Your account has been suspended.');
    }

    return true;
  }
}
