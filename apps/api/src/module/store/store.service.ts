import { Injectable } from '@nestjs/common';
import { Prisma, product_status } from '@prisma/client';
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from 'app/common/response';
import { IUser } from 'app/common/types/user.type';
import { PermissionService } from 'app/permissions/permission.service';
import { PrismaService } from 'app/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

type RetailConfig = {
  enabled?: boolean;
  template_id?: string;
  primary_color?: string;
  logo_url?: string;
  banner_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
};

@Injectable()
export class StoreService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly permissionService: PermissionService,
  ) {}
  private readonly errMsg = {
    STORE_NOT_FOUND: 'Cửa hàng không tồn tại',
    STORE_ALREADY_EXISTS: 'Cửa hàng đã tồn tại',
  };
  async create(createStoreDto: CreateStoreDto, user: IUser) {
    // create store when user is owner
    return await this.prismaService.store.create({
      data: {
        ...createStoreDto,
        owner_id: user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(user: IUser) {
    // find all store when user is owner or memeber
    return await this.prismaService.store.findMany({
      where: {
        OR: [
          {
            owner_id: user.id,
          },
          {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
            categories: true,
            customer: true,
            members: true,
          },
        },
      },
    });
  }

  async findOne(storeId: string, user: IUser) {
    // check user have access to the store members and owner in this store will access dc
    const hasAccess = await this.checkStoreAccess(storeId, user.id);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this store');
    }
    const store = await this.prismaService.store.findUnique({
      where: {
        id: storeId,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        store_payment: {
          select: {
            bank_qr_image_url: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
            categories: true,
            customer: true,
            members: true,
          },
        },
      },
    });
    if (!store) {
      throw new NotFoundError('Store not found');
    }
    return store;
  }

  async validateSubdomain(
    subdomain: string,
    storeId?: string,
  ): Promise<{ available: boolean; message?: string }> {
    if (!subdomain) {
      return {
        available: false,
        message: 'Vui lòng nhập subdomain.',
      };
    }

    const formattedSubdomain = subdomain.trim().toLowerCase();

    // Check format
    const subdomainRegex = /^[a-z0-9](-?[a-z0-9])*$/;
    if (!subdomainRegex.test(formattedSubdomain)) {
      return {
        available: false,
        message:
          'Subdomain chỉ được chứa chữ cái thường, số và dấu gạch ngang (không bắt đầu/kết thúc bằng dấu gạch ngang).',
      };
    }

    if (formattedSubdomain.length < 3 || formattedSubdomain.length > 30) {
      return {
        available: false,
        message: 'Subdomain phải có độ dài từ 3 đến 30 ký tự.',
      };
    }

    // Check blacklist
    const blacklist = [
      'admin',
      'api',
      'www',
      'main',
      'auth',
      'pos',
      'assets',
      'retail',
      'dashboard',
      'store',
      'oauth',
      'common',
      'feedback',
      'user',
      'static',
      'public',
      'private',
      'temp',
    ];
    if (blacklist.includes(formattedSubdomain)) {
      return {
        available: false,
        message:
          'Subdomain này trùng với từ khóa hệ thống, vui lòng chọn tên khác.',
      };
    }

    // Check uniqueness in DB
    const existing = await this.prismaService.store.findFirst({
      where: {
        subdomain: formattedSubdomain,
        NOT: storeId ? { id: storeId } : undefined,
      },
    });

    if (existing) {
      return {
        available: false,
        message: 'Subdomain này đã được đăng ký bởi cửa hàng khác.',
      };
    }

    return { available: true };
  }

  async getStoreBySubdomain(
    subdomain: string,
    options: { page?: string; limit?: string } = {},
  ) {
    const formattedSubdomain = subdomain.trim().toLowerCase();
    const page = Math.max(Number.parseInt(options.page || '1', 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(options.limit || '48', 10) || 48, 1),
      100,
    );
    const skip = (page - 1) * limit;

    const store = await this.prismaService.store.findUnique({
      where: { subdomain: formattedSubdomain },
      select: {
        id: true,
        name: true,
        description: true,
        phone_number: true,
        city: true,
        state: true,
        address: true,
        retail_config: true,
        store_payment: {
          select: {
            id: true,
            bank_code: true,
            bank_name: true,
            bank_account_number: true,
            bank_account_name: true,
            bank_qr_image_url: true,
            note: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundError(
        'Cửa hàng không tồn tại hoặc chưa cấu hình website bán hàng.',
      );
    }

    const retailConfig = (store.retail_config || {}) as RetailConfig;
    if (retailConfig.enabled !== true) {
      throw new NotFoundError('Cửa hàng chưa kích hoạt website bán hàng.');
    }

    const productWhere = {
      store_id: store.id,
      product_status: product_status.ACTIVE,
      is_deleted: false,
    };

    const [rawProducts, total] = await Promise.all([
      this.prismaService.product.findMany({
        where: productWhere,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          description: true,
          image_url: true,
          categories: {
            select: {
              id: true,
              name: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              price: true,
              sku: true,
              variant_stocks: {
                where: {
                  store_id: store.id,
                },
                select: {
                  onHand: true,
                },
              },
            },
          },
        },
      }),
      this.prismaService.product.count({
        where: productWhere,
      }),
    ]);
    const products = rawProducts.map((product) => ({
      ...product,
      price: product.variant[0]?.price || 0,
    }));

    return {
      store,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(storeId: string, updateStoreDto: UpdateStoreDto, user: IUser) {
    // Only store owner can update this store
    const isOwner = await this.checkIsOwner(storeId, user.id);

    if (!isOwner) {
      throw new ForbiddenError('Only store owner can update store information');
    }

    if (updateStoreDto.retail_config) {
      updateStoreDto.retail_config = this.sanitizeRetailConfig(
        updateStoreDto.retail_config,
      );
    }

    if (updateStoreDto.subdomain !== undefined) {
      if (
        updateStoreDto.subdomain === null ||
        updateStoreDto.subdomain.trim() === ''
      ) {
        updateStoreDto.subdomain = null;
      } else {
        const validationResult = await this.validateSubdomain(
          updateStoreDto.subdomain,
          storeId,
        );
        if (!validationResult.available) {
          throw new BadRequestError(validationResult.message);
        }
        updateStoreDto.subdomain = updateStoreDto.subdomain
          .trim()
          .toLowerCase();
      }
    }

    const { retail_config, ...storeFields } = updateStoreDto;
    const updateData: Prisma.StoreUpdateInput = {
      ...storeFields,
      ...(retail_config !== undefined
        ? { retail_config: retail_config as Prisma.InputJsonValue }
        : {}),
      updatedAt: new Date(),
    };

    return await this.prismaService.store.update({
      where: { id: storeId },
      data: updateData,
      include: {
        owner: {
          select: { id: true, username: true, email: true },
        },
      },
    });
  }

  async remove(storeId: string, user: IUser) {
    // Only store owner can delete store
    const isOwner = await this.checkIsOwner(storeId, user.id);
    if (!isOwner) {
      throw new ForbiddenError('Only store owner can delete store');
    }
    return await this.prismaService.store.delete({
      where: { id: storeId },
    });
  }

  async getPermissionsInStore(storeId: string, user: IUser) {
    return await this.permissionService.getUserWithPermissions(storeId, user);
  }
  async checkStore(storeId: string) {
    const store = await this.prismaService.store.findUnique({
      where: {
        id: storeId,
      },
    });
    if (!store) {
      throw new NotFoundError(this.errMsg.STORE_NOT_FOUND);
    }
  }

  private sanitizeRetailConfig(config: RetailConfig): RetailConfig {
    const sanitized: RetailConfig = {
      enabled: config.enabled === true,
      template_id: config.template_id || 'classic',
      primary_color: config.primary_color || '#2563eb',
    };

    if (config.logo_url) sanitized.logo_url = config.logo_url;
    if (config.banner_url) sanitized.banner_url = config.banner_url;
    if (config.facebook_url) sanitized.facebook_url = config.facebook_url;
    if (config.tiktok_url) sanitized.tiktok_url = config.tiktok_url;

    return sanitized;
  }

  async findAllPaginated(prismaQuery: Prisma.StoreFindManyArgs) {
    const [data, total] = await Promise.all([
      this.prismaService.store.findMany(prismaQuery),
      this.prismaService.store.count({ where: prismaQuery.where }),
    ]);
    return { data, total };
  }

  async getStoreAdminStats() {
    const [total, byCity, newToday] = await Promise.all([
      this.prismaService.store.count(),
      this.prismaService.store.groupBy({
        by: ['city'],
        _count: { _all: true },
      }),
      this.prismaService.store.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      total,
      newToday,
      byCity: byCity.reduce(
        (acc, c) => ({ ...acc, [c.city || 'Unknown']: c._count._all }),
        {} as Record<string, number>,
      ),
    };
  }

  async findOneAdmin(storeId: string) {
    const store = await this.prismaService.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: { id: true, username: true, email: true },
        },
        _count: {
          select: {
            products: true,
            members: true,
            orders: true,
          },
        },
      },
    });
    if (!store) throw new NotFoundError(this.errMsg.STORE_NOT_FOUND);
    return store;
  }

  // HELPER METHODS PRIVATE
  private async checkStoreAccess(
    storeId: string,
    userId: string,
  ): Promise<boolean> {
    const store = await this.prismaService.store.findFirst({
      where: {
        id: storeId,
        OR: [
          { owner_id: userId }, // User is owner
          {
            members: {
              some: {
                userId: userId, // User is member
              },
            },
          },
        ],
      },
    });

    return !!store;
  }
  private async checkIsOwner(
    storeId: string,
    ownerId: string,
  ): Promise<boolean> {
    const hasAccess = await this.prismaService.store.findFirst({
      where: {
        id: storeId,
        owner_id: ownerId,
      },
    });

    return !!hasAccess;
  }
}
