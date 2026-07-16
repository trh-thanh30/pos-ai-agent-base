import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'app/prisma/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveById(storeId: string, id: string) {
    return this.prisma.product.findFirst({
      where: {
        id,
        store_id: storeId,
        is_deleted: false,
      },
    });
  }

  findDetail(storeId: string, id: string) {
    return this.prisma.product.findUnique({
      where: {
        store_id: storeId,
        id,
        is_deleted: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        sku: true,
        image_url: true,
        product_status: true,
        created_by: true,
        tags: true,
        baseUnit: true,
        categories: true,
        updatedAt: true,
        createdAt: true,
        meta: true,
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            conversions: {
              select: {
                id: true,
                name: true,
                factor: true,
              },
            },
            variant_stocks: {
              where: {
                store_id: storeId,
              },
              select: {
                onHand: true,
                reserved: true,
                damaged: true,
              },
              take: 1,
            },
          },
        },
      },
    });
  }

  softDelete(storeId: string, id: string) {
    return this.prisma.product.update({
      where: { id, store_id: storeId },
      data: {
        is_deleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async filter(storeId: string, query: Prisma.ProductFindManyArgs) {
    const where: Prisma.ProductWhereInput = {
      AND: [query.where ?? {}, { store_id: storeId, is_deleted: false }],
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: query.orderBy,
        include: {
          categories: true,
          tags: true,
          variant: true,
          purchase_order_items: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data: products, total };
  }
}
