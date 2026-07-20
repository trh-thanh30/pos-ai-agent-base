import { StoreService } from '../store.service';

describe('StoreService.createStorefrontOrder', () => {
  function createService() {
    const tx = {
      customer: {
        create: jest.fn().mockResolvedValue({ id: 'customer-1' }),
      },
      order: {
        create: jest.fn().mockResolvedValue({
          id: 'order-1',
          code: 'DH00001',
          total_amount: 240,
          status: 'PENDING',
        }),
      },
    };
    const prisma = {
      store: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'store-1',
          owner_id: 'owner-1',
          retail_config: {
            enabled: true,
            checkout: {
              enabled: true,
              allow_cod: true,
              allow_bank_transfer: true,
            },
          },
          store_payment: [],
        }),
      },
      variant: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: '22222222-2222-4222-8222-222222222222',
            product_id: '11111111-1111-4111-8111-111111111111',
            price: 120,
          },
        ]),
      },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const applyStock = {
      execute: jest.fn().mockResolvedValue({}),
    };
    const generateOrderCode = {
      generateOrderCode: jest.fn().mockResolvedValue('DH00001'),
    };
    const service = new StoreService(
      prisma as never,
      {} as never,
      applyStock as never,
      generateOrderCode as never,
    );
    return { service, prisma, tx, applyStock };
  }

  it('uses server prices and creates a pending order transactionally', async () => {
    const { service, tx, applyStock } = createService();

    const result = await service.createStorefrontOrder('demo-shop', {
      customer_name: 'Nguyen Van A',
      customer_phone: '0912345678',
      customer_address: '1 Nguyen Hue',
      payment_method: 'cod',
      items: [
        {
          product_id: '11111111-1111-4111-8111-111111111111',
          variant_id: '22222222-2222-4222-8222-222222222222',
          quantity: 2,
        },
      ],
    });

    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          total_amount: 240,
          subtotal_amount: 240,
          cashier_id: 'owner-1',
          customer_id: 'customer-1',
          status: 'PENDING',
          order_item: {
            createMany: {
              data: [
                expect.objectContaining({
                  price: 120,
                  quantity: 2,
                  total: 240,
                }),
              ],
            },
          },
        }),
        select: expect.any(Object),
      }),
    );
    expect(applyStock.execute).toHaveBeenCalledWith(
      'SALE',
      'store-1',
      '22222222-2222-4222-8222-222222222222',
      '11111111-1111-4111-8111-111111111111',
      2,
      tx,
    );
    expect(result.order.code).toBe('DH00001');
    expect(result.payment).toBeNull();
  });

  it('rejects a variant that does not belong to the submitted product', async () => {
    const { service, prisma } = createService();
    prisma.variant.findMany.mockResolvedValue([
      {
        id: '22222222-2222-4222-8222-222222222222',
        product_id: '33333333-3333-4333-8333-333333333333',
        price: 120,
      },
    ]);

    await expect(
      service.createStorefrontOrder('demo-shop', {
        customer_name: 'Nguyen Van A',
        customer_phone: '0912345678',
        items: [
          {
            product_id: '11111111-1111-4111-8111-111111111111',
            variant_id: '22222222-2222-4222-8222-222222222222',
            quantity: 1,
          },
        ],
      }),
    ).rejects.toThrow('Một sản phẩm hoặc phân loại không còn khả dụng.');
  });
});
