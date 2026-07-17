import { Injectable } from '@nestjs/common';
import { Prisma, product_type } from '@prisma/client';
import { PrismaService } from 'app/prisma/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(fn);
  }

  findActiveById(storeId: string, id: string) {
    return this.prisma.product.findFirst({
      where: {
        id,
        store_id: storeId,
        is_deleted: false,
      },
    });
  }

  findBySku(storeId: string, sku: string, productId?: string) {
    return this.prisma.product.findFirst({
      where: {
        sku,
        store_id: storeId,
        NOT: { id: productId },
      },
    });
  }

  findVariantByBarcode(storeId: string, barcode: string, productId?: string) {
    return this.prisma.variant.findFirst({
      where: {
        barcode,
        product: {
          store_id: storeId,
          is_deleted: false,
        },
        ...(productId ? { NOT: { product_id: productId } } : {}),
      },
    });
  }

  createQuickProduct(
    tx: Prisma.TransactionClient,
    input: {
      data: Record<string, unknown>;
      storeId: string;
      createdBy: string;
      categoryIds?: string[];
      tagIds?: string[];
    },
  ) {
    const { data, storeId, createdBy, categoryIds, tagIds } = input;

    const createData = {
      ...data,
      store_id: storeId,
      created_by: createdBy,
      source_type: product_type.QUICK_CREATE,
      categories: categoryIds?.length
        ? { connect: categoryIds.map((id) => ({ id })) }
        : undefined,
      tags: tagIds?.length
        ? { connect: tagIds.map((id) => ({ id })) }
        : undefined,
    } as Prisma.ProductCreateArgs['data'];

    return tx.product.create({
      data: createData,
      include: {
        categories: true,
        tags: true,
        variant: true,
      },
    });
  }

  updateProductImage(
    tx: Prisma.TransactionClient,
    productId: string,
    imageUrl: string,
  ) {
    return tx.product.update({
      where: { id: productId },
      data: { image_url: imageUrl },
    });
  }

  createVariant(
    tx: Prisma.TransactionClient,
    data: Prisma.VariantUncheckedCreateInput,
  ) {
    return tx.variant.create({ data });
  }

  createVariantStock(
    tx: Prisma.TransactionClient,
    data: Prisma.VariantStockUncheckedCreateInput,
  ) {
    return tx.variantStock.create({ data });
  }

  updateProduct(storeId: string, id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id, store_id: storeId },
      data,
      include: { categories: true, tags: true },
    });
  }

  findFirstVariant(productId: string) {
    return this.prisma.variant.findFirst({
      where: { product_id: productId },
    });
  }

  updateVariantBarcode(variantId: string, barcode: string) {
    return this.prisma.variant.update({
      where: { id: variantId },
      data: { barcode },
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
