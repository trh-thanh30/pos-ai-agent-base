import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from 'app/prisma/prisma.service';

@Injectable()
export class OauthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  findUserByIdAndRefreshToken(id: string, refreshToken: string) {
    return this.prisma.user.findUnique({
      where: { id, refresh_token: refreshToken },
    });
  }

  updateUserRefreshToken(userId: string, refreshToken: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token: refreshToken, lastLoginAt: new Date() },
    });
  }

  findFirstOwnedStore(ownerId: string) {
    return this.prisma.store.findFirst({
      where: { owner_id: ownerId },
    });
  }

  listOwnedStores(ownerId: string) {
    return this.prisma.store.findMany({
      where: { owner_id: ownerId },
    });
  }
}
