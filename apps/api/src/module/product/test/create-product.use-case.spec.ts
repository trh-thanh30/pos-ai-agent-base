import { stock_movement_type } from '@prisma/client';
import { AssetEntityType } from 'app/module/assets/types/asset-entity.type';
import { CreateProductUseCase } from '../use-cases/create-product.use-case';

describe('CreateProductUseCase', () => {
  const mockUser = {
    id: 'user-1',
    storeId: 'store-1',
  };

  it('creates quick product, default variant, stock and stock movement', async () => {
    const tx = {};
    const productRepository = {
      transaction: jest.fn((callback) => callback(tx)),
      createQuickProduct: jest.fn().mockResolvedValue({
        id: 'product-1',
        name: 'Coffee',
        image_url: null,
        baseUnit: 'pcs',
      }),
      createVariant: jest.fn().mockResolvedValue({
        id: 'variant-1',
        product_id: 'product-1',
        name: 'Coffee',
      }),
      createVariantStock: jest.fn().mockResolvedValue({ id: 'stock-1' }),
      updateProductImage: jest.fn(),
    };
    const productValidator = {
      ensureSkuAvailable: jest.fn(),
      ensureBarcodeAvailable: jest.fn(),
    };
    const generateProductSkuUseCase = {
      generateSku: jest.fn().mockResolvedValue('SP00001'),
    };
    const generateVariantSkuUseCase = {
      generateSkuVariant: jest.fn().mockResolvedValue('BT00001'),
    };
    const stockMovementService = {
      create: jest.fn().mockResolvedValue({ id: 'movement-1' }),
    };
    const uploadAssetUseCase = {
      execute: jest.fn().mockResolvedValue({ url: 'https://asset.test/a.png' }),
    };
    const useCase = new CreateProductUseCase(
      productRepository as never,
      productValidator as never,
      generateProductSkuUseCase as never,
      generateVariantSkuUseCase as never,
      stockMovementService as never,
      uploadAssetUseCase as never,
    );

    const result = await useCase.execute({
      user: mockUser as never,
      storeId: 'store-1',
      data: {
        name: 'Coffee',
        sku: '',
        baseUnit: 'pcs',
        quantity: 5,
        price: 100,
        cost: 60,
        barcode: 'BAR-1',
        categoryIds: ['category-1'],
        tagIds: ['tag-1'],
      } as never,
      file: { originalname: 'a.png' } as never,
    });

    expect(productValidator.ensureSkuAvailable).toHaveBeenCalledWith(
      'SP00001',
      'store-1',
    );
    expect(productRepository.createQuickProduct).toHaveBeenCalledWith(tx, {
      data: {
        name: 'Coffee',
        sku: 'SP00001',
        baseUnit: 'pcs',
      },
      storeId: 'store-1',
      createdBy: 'user-1',
      categoryIds: ['category-1'],
      tagIds: ['tag-1'],
    });
    expect(uploadAssetUseCase.execute).toHaveBeenCalledWith(
      mockUser,
      { originalname: 'a.png' },
      {
        entityId: 'product-1',
        entityType: AssetEntityType.PRODUCT,
        folder: 'products',
      },
    );
    expect(productRepository.createVariant).toHaveBeenCalledWith(tx, {
      product_id: 'product-1',
      name: 'Coffee',
      sku: 'BT00001',
      price: 100,
      cost: 60,
      barcode: 'BAR-1',
    });
    expect(stockMovementService.create).toHaveBeenCalledWith(
      'variant-1',
      stock_movement_type.ADJUSTMENT,
      5,
      tx,
    );
    expect(result.product.image_url).toBe('https://asset.test/a.png');
  });

  it('skips stock movement when quantity is zero', async () => {
    const productRepository = {
      transaction: jest.fn((callback) => callback({})),
      createQuickProduct: jest.fn().mockResolvedValue({
        id: 'product-1',
        name: 'Coffee',
        image_url: null,
        baseUnit: 'pcs',
      }),
      createVariant: jest.fn().mockResolvedValue({ id: 'variant-1' }),
      createVariantStock: jest.fn().mockResolvedValue({ id: 'stock-1' }),
    };
    const stockMovementService = {
      create: jest.fn(),
    };
    const useCase = new CreateProductUseCase(
      productRepository as never,
      {
        ensureSkuAvailable: jest.fn(),
        ensureBarcodeAvailable: jest.fn(),
      } as never,
      { generateSku: jest.fn().mockResolvedValue('SP00001') } as never,
      { generateSkuVariant: jest.fn().mockResolvedValue('BT00001') } as never,
      stockMovementService as never,
      { execute: jest.fn() } as never,
    );

    await useCase.execute({
      user: mockUser as never,
      storeId: 'store-1',
      data: {
        name: 'Coffee',
        sku: 'SKU-1',
        baseUnit: 'pcs',
        quantity: 0,
      } as never,
    });

    expect(stockMovementService.create).not.toHaveBeenCalled();
  });
});
