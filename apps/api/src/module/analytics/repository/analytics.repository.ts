import { Injectable } from '@nestjs/common';
import { order_return_status, order_status } from '@prisma/client';
import { PrismaService } from 'app/prisma/prisma.service';
import type {
  AnalyticsInventoryRecord,
  AnalyticsOrderItemRecord,
  AnalyticsOrderRecord,
  AnalyticsRecentActivityRecord,
} from '../types/analytics-response.type';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrders(
    storeId: string,
    range: { from: Date; to: Date },
    statuses?: order_status[],
  ): Promise<AnalyticsOrderRecord[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        store_id: storeId,
        status: statuses?.length ? { in: statuses } : undefined,
        createdAt: { gte: range.from, lte: range.to },
      },
      select: {
        id: true,
        customer_id: true,
        total_amount: true,
        subtotal_amount: true,
        discount_amount: true,
        tax_amount: true,
        payment_method: true,
        status: true,
        createdAt: true,
        order_item: { select: { quantity: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return orders.map((order) => ({
      id: order.id,
      customerId: order.customer_id,
      totalAmount: Number(order.total_amount),
      subtotalAmount: Number(order.subtotal_amount),
      discountAmount: Number(order.discount_amount),
      taxAmount: Number(order.tax_amount),
      paymentMethod: order.payment_method,
      status: order.status,
      createdAt: order.createdAt,
      unitsSold: order.order_item.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
    }));
  }

  async findCompletedOrderItems(
    storeId: string,
    range: { from: Date; to: Date },
  ): Promise<AnalyticsOrderItemRecord[]> {
    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          store_id: storeId,
          status: order_status.COMPLETED,
          createdAt: { gte: range.from, lte: range.to },
        },
      },
      select: {
        product_id: true,
        variant_id: true,
        quantity: true,
        total: true,
        order: { select: { createdAt: true } },
        product: {
          select: {
            name: true,
            baseUnit: true,
            image_url: true,
            categories: { select: { id: true, name: true } },
          },
        },
        variant: { select: { name: true, cost: true, price: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return items.map((item) => ({
      productId: item.product_id,
      productName: item.product.name,
      imageUrl: item.product.image_url,
      variantId: item.variant_id,
      variantName: item.variant.name,
      currentCost: Number(item.variant.cost || 0),
      currentPrice: Number(item.variant.price),
      baseUnit: item.product.baseUnit,
      quantity: item.quantity,
      total: Number(item.total),
      createdAt: item.order.createdAt,
      categories: item.product.categories,
    }));
  }

  async findRefundedReturns(storeId: string, range: { from: Date; to: Date }) {
    const returns = await this.prisma.orderReturn.findMany({
      where: {
        store_id: storeId,
        return_status: order_return_status.REFUNDED,
        createdAt: { gte: range.from, lte: range.to },
      },
      select: { id: true, total: true, items_length: true, createdAt: true },
    });
    return returns.map((item) => ({
      id: item.id,
      total: Number(item.total),
      items: item.items_length,
      createdAt: item.createdAt,
    }));
  }

  async findInventory(storeId: string): Promise<AnalyticsInventoryRecord[]> {
    const variants = await this.prisma.variant.findMany({
      where: {
        product: {
          store_id: storeId,
          is_deleted: false,
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        cost: true,
        product: { select: { id: true, name: true, image_url: true } },
        variant_stocks: {
          where: { store_id: storeId },
          select: { onHand: true, reserved: true, damaged: true },
          take: 1,
        },
      },
    });

    return variants.map((variant) => {
      const stock = variant.variant_stocks[0];
      return {
        productId: variant.product.id,
        productName: variant.product.name,
        imageUrl: variant.product.image_url,
        variantId: variant.id,
        variantName: variant.name,
        price: Number(variant.price),
        cost: Number(variant.cost || 0),
        onHand: stock?.onHand || 0,
        reserved: stock?.reserved || 0,
        damaged: stock?.damaged || 0,
      };
    });
  }

  findCustomerOrderStats(storeId: string, to: Date) {
    return this.prisma.order.groupBy({
      by: ['customer_id'],
      where: {
        store_id: storeId,
        status: order_status.COMPLETED,
        customer_id: { not: null },
        createdAt: { lte: to },
      },
      _min: { createdAt: true },
      _max: { createdAt: true },
      _count: { _all: true },
      _sum: { total_amount: true },
    });
  }

  async findRecentActivity(
    storeId: string,
    limit: number,
  ): Promise<AnalyticsRecentActivityRecord[]> {
    const [orders, movements] = await Promise.all([
      this.prisma.order.findMany({
        where: { store_id: storeId },
        select: {
          id: true,
          code: true,
          total_amount: true,
          payment_method: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.stockMovement.findMany({
        where: { variants: { product: { store_id: storeId } } },
        select: {
          id: true,
          quantity: true,
          type: true,
          createdAt: true,
          variants: {
            select: {
              name: true,
              product: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ]);

    return [
      ...orders.map((order) => ({
        id: order.id,
        type: 'order' as const,
        createdAt: order.createdAt,
        data: {
          code: order.code || order.id,
          amount: Number(order.total_amount),
          paymentMethod: order.payment_method,
        },
      })),
      ...movements.map((movement) => ({
        id: movement.id,
        type: 'stock' as const,
        createdAt: movement.createdAt,
        data: {
          quantity: movement.quantity,
          variantName: movement.variants.name,
          productName: movement.variants.product.name,
          stockType: movement.type,
        },
      })),
    ];
  }
}
