import { Injectable } from '@nestjs/common';
import {
  order_status,
  payment_method,
  Prisma,
  product_status,
  stock_movement_type,
} from '@prisma/client';
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
import { CreateStorefrontOrderDto } from './dto/create-storefront-order.dto';
import { ApplyStockUseCase } from 'app/module/variant/use-case/apply-stock.usecase';
import { GenerateOrderCodeUseCase } from 'app/module/orders/use-case/generate-order-code.usecase';

type RetailConfig = {
  schema_version?: number;
  enabled?: boolean;
  template_id?: string;
  primary_color?: string;
  logo_url?: string;
  banner_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  brand?: {
    primary_color?: string;
    accent_color?: string;
    background_color?: string;
    text_color?: string;
    font_pair?: string;
    radius?: string;
    logo_url?: string;
    logo_asset_id?: string;
    banner_url?: string;
    banner_asset_id?: string;
    banner_urls?: string[];
    banner_asset_ids?: string[];
  };
  announcement?: {
    enabled?: boolean;
    text?: string;
  };
  home?: {
    hero_title?: string;
    hero_subtitle?: string;
    hero_cta_label?: string;
    show_hero?: boolean;
    show_hero_slider?: boolean;
    show_categories?: boolean;
    show_featured_products?: boolean;
    featured_heading?: string;
  };
  catalog?: {
    show_search?: boolean;
    show_category_filter?: boolean;
    show_product_description?: boolean;
    show_stock_status?: boolean;
    show_out_of_stock?: boolean;
    quick_add?: boolean;
    image_ratio?: string;
    products_per_page?: number;
  };
  checkout?: {
    enabled?: boolean;
    allow_note?: boolean;
    require_address?: boolean;
    allow_cod?: boolean;
    allow_bank_transfer?: boolean;
    success_message?: string;
  };
  footer?: {
    show_contact?: boolean;
    show_business_hours?: boolean;
    show_powered_by?: boolean;
    show_newsletter?: boolean;
    newsletter_title?: string;
    newsletter_placeholder?: string;
    newsletter_button_label?: string;
    company_title?: string;
    contact_email?: string;
    about_title?: string;
    about_links?: string;
    support_title?: string;
    support_links?: string;
    policy_title?: string;
    policy_links?: string;
    copyright_text?: string;
    policy_text?: string;
  };
  social?: {
    facebook_url?: string;
    instagram_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
    zalo_url?: string;
  };
  seo?: {
    title?: string;
    description?: string;
  };
};

@Injectable()
export class StoreService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly permissionService: PermissionService,
    private readonly applyStock: ApplyStockUseCase,
    private readonly generateOrderCode: GenerateOrderCodeUseCase,
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
        subdomain: true,
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

    const { store_payment, ...publicStore } = store;
    return {
      store: {
        ...publicStore,
        payment_methods: {
          bank_transfer: store_payment.length > 0,
        },
      },
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStorefrontProduct(subdomain: string, productId: string) {
    const store = await this.prismaService.store.findUnique({
      where: { subdomain: subdomain.trim().toLowerCase() },
      select: {
        id: true,
        retail_config: true,
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

    const product = await this.prismaService.product.findFirst({
      where: {
        id: productId,
        store_id: store.id,
        product_status: product_status.ACTIVE,
        is_deleted: false,
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
    });

    if (!product) {
      throw new NotFoundError('Sản phẩm không tồn tại hoặc đã ngừng bán.');
    }

    return {
      ...product,
      price: product.variant[0]?.price || 0,
    };
  }

  async createStorefrontOrder(
    subdomain: string,
    dto: CreateStorefrontOrderDto,
  ) {
    const store = await this.prismaService.store.findUnique({
      where: { subdomain: subdomain.trim().toLowerCase() },
      select: {
        id: true,
        owner_id: true,
        retail_config: true,
        store_payment: {
          take: 1,
          orderBy: { createdAt: 'asc' },
          select: {
            bank_code: true,
            bank_name: true,
            bank_account_number: true,
            bank_account_name: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundError('Cửa hàng không tồn tại.');
    }

    const config = (store.retail_config || {}) as RetailConfig;
    if (config.enabled !== true || config.checkout?.enabled === false) {
      throw new BadRequestError('Cửa hàng hiện không nhận đơn trực tuyến.');
    }

    const requestedPayment = dto.payment_method || 'cod';
    if (requestedPayment === 'cod' && config.checkout?.allow_cod === false) {
      throw new BadRequestError(
        'Cửa hàng không hỗ trợ thanh toán khi nhận hàng.',
      );
    }
    if (
      requestedPayment === 'bank_transfer' &&
      (config.checkout?.allow_bank_transfer === false ||
        !store.store_payment[0])
    ) {
      throw new BadRequestError(
        'Cửa hàng chưa sẵn sàng nhận thanh toán chuyển khoản.',
      );
    }
    if (
      config.checkout?.require_address === true &&
      !dto.customer_address?.trim()
    ) {
      throw new BadRequestError('Vui lòng nhập địa chỉ nhận hàng.');
    }

    const aggregatedItems = new Map<
      string,
      { product_id: string; variant_id: string; quantity: number }
    >();
    for (const item of dto.items) {
      const existing = aggregatedItems.get(item.variant_id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        aggregatedItems.set(item.variant_id, { ...item });
      }
    }
    const requestedItems = Array.from(aggregatedItems.values());
    const variants = await this.prismaService.variant.findMany({
      where: {
        id: { in: requestedItems.map((item) => item.variant_id) },
        product: {
          store_id: store.id,
          product_status: product_status.ACTIVE,
          is_deleted: false,
        },
      },
      select: {
        id: true,
        product_id: true,
        price: true,
      },
    });
    const variantsById = new Map(
      variants.map((variant) => [variant.id, variant]),
    );

    const verifiedItems = requestedItems.map((item) => {
      const variant = variantsById.get(item.variant_id);
      if (!variant || variant.product_id !== item.product_id) {
        throw new BadRequestError(
          'Một sản phẩm hoặc phân loại không còn khả dụng.',
        );
      }
      return {
        ...item,
        price: variant.price,
        total: variant.price * item.quantity,
      };
    });
    const totalAmount = verifiedItems.reduce(
      (total, item) => total + item.total,
      0,
    );
    const orderCode = await this.generateOrderCode.generateOrderCode(store.id);

    const result = await this.prismaService.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          store_id: store.id,
          name: dto.customer_name.trim(),
          phone: dto.customer_phone.trim(),
          address: dto.customer_address?.trim(),
        },
      });
      const order = await tx.order.create({
        data: {
          store_id: store.id,
          cashier_id: store.owner_id,
          customer_id: customer.id,
          customer_name: dto.customer_name.trim(),
          code: orderCode,
          subtotal_amount: totalAmount,
          total_amount: totalAmount,
          discount_amount: 0,
          tax_amount: 0,
          customer_pay_amount: 0,
          change_amount: 0,
          status: order_status.PENDING,
          payment_method:
            requestedPayment === 'bank_transfer'
              ? payment_method.BANK_TRANSFER
              : payment_method.CASH,
          order_item: {
            createMany: {
              data: verifiedItems.map((item) => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
                discount_rate: 0,
                tax_rate: 0,
                meta: {
                  source: 'STOREFRONT',
                  customer_phone: dto.customer_phone.trim(),
                  customer_address: dto.customer_address?.trim(),
                  customer_note: dto.customer_note?.trim(),
                },
              })),
            },
          },
        },
        select: {
          id: true,
          code: true,
          total_amount: true,
          status: true,
        },
      });

      for (const item of verifiedItems) {
        await this.applyStock.execute(
          stock_movement_type.SALE,
          store.id,
          item.variant_id,
          item.product_id,
          item.quantity,
          tx,
        );
      }
      return order;
    });

    return {
      order: result,
      payment:
        requestedPayment === 'bank_transfer' ? store.store_payment[0] : null,
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
    const sanitized = JSON.parse(JSON.stringify(config)) as RetailConfig;
    const templateAliases: Record<string, string> = {
      classic: 'orebi',
      ecommerce: 'orebi',
      market: 'orebi',
      editorial: 'orebi',
      specialist: 'orebi',
      restaurant: 'orebi',
    };
    sanitized.schema_version = 2;
    sanitized.enabled = config.enabled === true;
    sanitized.template_id =
      templateAliases[config.template_id || ''] ||
      config.template_id ||
      'orebi';

    if (sanitized.brand) {
      sanitized.primary_color = sanitized.brand.primary_color;
      sanitized.logo_url = sanitized.brand.logo_url;
      sanitized.banner_url = sanitized.brand.banner_url;
    } else {
      sanitized.primary_color = sanitized.primary_color || '#0f766e';
    }

    if (sanitized.social) {
      sanitized.facebook_url = sanitized.social.facebook_url;
      sanitized.tiktok_url = sanitized.social.tiktok_url;
    }

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
