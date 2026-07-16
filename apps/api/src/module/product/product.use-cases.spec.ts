import { BadRequestError } from 'app/common/response';
import { DeleteProductUseCase } from './use-cases/delete-product.use-case';
import { FilterProductsUseCase } from './use-cases/filter-products.use-case';
import { GetProductDetailUseCase } from './use-cases/get-product-detail.use-case';

describe('Product use cases', () => {
  const createRepository = () => ({
    findDetail: jest.fn(),
    findActiveById: jest.fn(),
    softDelete: jest.fn(),
    filter: jest.fn(),
  });

  it('maps variant stock fields in product detail', async () => {
    const productRepository = createRepository();
    productRepository.findDetail.mockResolvedValue({
      id: 'product-1',
      variant: [
        {
          id: 'variant-1',
          variant_stocks: [{ onHand: 10, reserved: 2, damaged: 1 }],
        },
      ],
    });
    const useCase = new GetProductDetailUseCase(productRepository as never);

    await expect(
      useCase.execute('store-1', 'product-1'),
    ).resolves.toMatchObject({
      id: 'product-1',
      variant: [{ id: 'variant-1', onHand: 10, reserved: 2, damaged: 1 }],
    });
  });

  it('throws when product detail is missing', async () => {
    const productRepository = createRepository();
    productRepository.findDetail.mockResolvedValue(null);
    const useCase = new GetProductDetailUseCase(productRepository as never);

    await expect(useCase.execute('store-1', 'missing')).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('soft deletes an existing product', async () => {
    const productRepository = createRepository();
    productRepository.findActiveById.mockResolvedValue({ id: 'product-1' });
    productRepository.softDelete.mockResolvedValue({ id: 'product-1' });
    const useCase = new DeleteProductUseCase(productRepository as never);

    await useCase.execute('store-1', 'product-1');

    expect(productRepository.softDelete).toHaveBeenCalledWith(
      'store-1',
      'product-1',
    );
  });

  it('delegates filter queries to the repository', async () => {
    const productRepository = createRepository();
    productRepository.filter.mockResolvedValue({ data: [], total: 0 });
    const useCase = new FilterProductsUseCase(productRepository as never);

    await expect(
      useCase.execute('store-1', { skip: 0, take: 10 }),
    ).resolves.toEqual({ data: [], total: 0 });
    expect(productRepository.filter).toHaveBeenCalledWith('store-1', {
      skip: 0,
      take: 10,
    });
  });
});
