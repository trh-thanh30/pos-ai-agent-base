import { BadRequestError } from 'app/common/response';
import { GetProductDetailUseCase } from '../use-cases/get-product-detail.use-case';

describe('GetProductDetailUseCase', () => {
  it('maps variant stock fields in product detail', async () => {
    const productRepository = {
      findDetail: jest.fn().mockResolvedValue({
        id: 'product-1',
        variant: [
          {
            id: 'variant-1',
            variant_stocks: [{ onHand: 10, reserved: 2, damaged: 1 }],
          },
        ],
      }),
    };
    const useCase = new GetProductDetailUseCase(productRepository as never);

    await expect(
      useCase.execute('store-1', 'product-1'),
    ).resolves.toMatchObject({
      id: 'product-1',
      variant: [{ id: 'variant-1', onHand: 10, reserved: 2, damaged: 1 }],
    });
  });

  it('throws when product detail is missing', async () => {
    const productRepository = {
      findDetail: jest.fn().mockResolvedValue(null),
    };
    const useCase = new GetProductDetailUseCase(productRepository as never);

    await expect(useCase.execute('store-1', 'missing')).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
});
