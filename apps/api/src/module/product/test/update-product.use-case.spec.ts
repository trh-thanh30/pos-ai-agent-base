import { AssetEntityType } from 'app/module/assets/types/asset-entity.type';
import { UpdateProductUseCase } from '../use-cases/update-product.use-case';

describe('UpdateProductUseCase', () => {
  const mockUser = {
    id: 'user-1',
    storeId: 'store-1',
  };

  it('updates product, uploads asset and updates first variant barcode', async () => {
    const productRepository = {
      updateProduct: jest.fn().mockResolvedValue({ id: 'product-1' }),
      findFirstVariant: jest.fn().mockResolvedValue({ id: 'variant-1' }),
      updateVariantBarcode: jest.fn().mockResolvedValue({ id: 'variant-1' }),
    };
    const productValidator = {
      ensureProductExists: jest.fn(),
      ensureSkuAvailable: jest.fn(),
      ensureBarcodeAvailable: jest.fn(),
    };
    const uploadAssetUseCase = {
      execute: jest.fn().mockResolvedValue({ url: 'https://asset.test/b.png' }),
    };
    const useCase = new UpdateProductUseCase(
      productRepository as never,
      productValidator as never,
      uploadAssetUseCase as never,
    );

    await useCase.execute({
      user: mockUser as never,
      storeId: 'store-1',
      productId: 'product-1',
      data: {
        name: 'New Coffee',
        sku: 'SKU-2',
        image_url: 'old.png',
        barcode: 'BAR-2',
        categoryIds: ['category-1'],
        tagIds: ['tag-1'],
      } as never,
      file: { originalname: 'b.png' } as never,
    });

    expect(productValidator.ensureProductExists).toHaveBeenCalledWith(
      'product-1',
      'store-1',
    );
    expect(productValidator.ensureSkuAvailable).toHaveBeenCalledWith(
      'SKU-2',
      'store-1',
      'product-1',
    );
    expect(uploadAssetUseCase.execute).toHaveBeenCalledWith(
      mockUser,
      { originalname: 'b.png' },
      {
        entityId: 'product-1',
        entityType: AssetEntityType.PRODUCT,
        folder: 'products',
      },
    );
    expect(productRepository.updateProduct).toHaveBeenCalledWith(
      'store-1',
      'product-1',
      {
        name: 'New Coffee',
        sku: 'SKU-2',
        image_url: 'https://asset.test/b.png',
        categories: { set: [{ id: 'category-1' }] },
        tags: { set: [{ id: 'tag-1' }] },
      },
    );
    expect(productRepository.updateVariantBarcode).toHaveBeenCalledWith(
      'variant-1',
      'BAR-2',
    );
  });

  it('does not update variant barcode when barcode is omitted', async () => {
    const productRepository = {
      updateProduct: jest.fn().mockResolvedValue({ id: 'product-1' }),
      findFirstVariant: jest.fn(),
      updateVariantBarcode: jest.fn(),
    };
    const useCase = new UpdateProductUseCase(
      productRepository as never,
      {
        ensureProductExists: jest.fn(),
        ensureSkuAvailable: jest.fn(),
        ensureBarcodeAvailable: jest.fn(),
      } as never,
      { execute: jest.fn() } as never,
    );

    await useCase.execute({
      user: mockUser as never,
      storeId: 'store-1',
      productId: 'product-1',
      data: {
        name: 'New Coffee',
      } as never,
    });

    expect(productRepository.findFirstVariant).not.toHaveBeenCalled();
    expect(productRepository.updateVariantBarcode).not.toHaveBeenCalled();
  });
});
