import { DeleteProductUseCase } from '../use-cases/delete-product.use-case';

describe('DeleteProductUseCase', () => {
  it('soft deletes an existing product', async () => {
    const productRepository = {
      findActiveById: jest.fn().mockResolvedValue({ id: 'product-1' }),
      softDelete: jest.fn().mockResolvedValue({ id: 'product-1' }),
    };
    const useCase = new DeleteProductUseCase(productRepository as never);

    await useCase.execute('store-1', 'product-1');

    expect(productRepository.softDelete).toHaveBeenCalledWith(
      'store-1',
      'product-1',
    );
  });
});
