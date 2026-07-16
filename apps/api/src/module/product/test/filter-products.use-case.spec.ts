import { FilterProductsUseCase } from '../use-cases/filter-products.use-case';

describe('FilterProductsUseCase', () => {
  it('delegates filter queries to the repository', async () => {
    const productRepository = {
      filter: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    };
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
