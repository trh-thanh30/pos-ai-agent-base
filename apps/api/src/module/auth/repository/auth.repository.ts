import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from 'app/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findUserByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  findUserByEmailOrUsername(usernameOrEmail: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      },
      include: {
        ownedStores: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
        memberships: {
          include: {
            store: {
              include: {
                _count: {
                  select: { members: true },
                },
              },
            },
          },
        },
      },
    });
  }

  findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findUserByIdAndRefreshToken(id: string, refreshToken: string) {
    return this.prisma.user.findUnique({
      where: { id, refresh_token: refreshToken },
    });
  }

  findUserByRefreshToken(refreshToken: string) {
    return this.prisma.user.findFirst({
      where: { refresh_token: refreshToken },
    });
  }

  findUserByPasswordResetCode(code: string) {
    return this.prisma.user.findFirst({
      where: { password_reset_code: code },
    });
  }

  createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  updateUserRefreshToken(userId: string, refreshToken: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        refresh_token: refreshToken,
        lastLoginAt: refreshToken ? new Date() : undefined,
      },
    });
  }

  findStoreById(id: string) {
    return this.prisma.store.findUnique({ where: { id } });
  }

  findFirstOwnedStore(ownerId: string) {
    return this.prisma.store.findFirst({
      where: { owner_id: ownerId },
    });
  }

  findStoreMember(userId: string, storeId: string) {
    return this.prisma.storeMember.findFirst({
      where: { userId, storeId },
    });
  }
}
