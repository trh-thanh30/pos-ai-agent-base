import type {
  order_status,
  payment_method,
  stock_movement_type,
} from '@prisma/client';

export interface AnalyticsMetric {
  value: number;
  previousValue: number | null;
  changeValue: number | null;
  changePercent: number | null;
}

export interface AnalyticsOrderRecord {
  id: string;
  customerId: string | null;
  totalAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  paymentMethod: payment_method;
  status: order_status;
  createdAt: Date;
  unitsSold: number;
}

export interface AnalyticsOrderItemRecord {
  productId: string;
  productName: string;
  imageUrl: string | null;
  variantId: string;
  variantName: string;
  currentCost: number;
  currentPrice: number;
  baseUnit: string;
  quantity: number;
  total: number;
  createdAt: Date;
  categories: Array<{ id: string; name: string }>;
}

export interface AnalyticsInventoryRecord {
  productId: string;
  productName: string;
  imageUrl: string | null;
  variantId: string;
  variantName: string;
  price: number;
  cost: number;
  onHand: number;
  reserved: number;
  damaged: number;
}

export interface AnalyticsRecentActivityRecord {
  id: string;
  type: 'order' | 'stock';
  createdAt: Date;
  data: {
    code?: string;
    amount?: number;
    paymentMethod?: payment_method;
    quantity?: number;
    variantName?: string;
    productName?: string;
    stockType?: stock_movement_type;
  };
}
