import { Injectable } from '@nestjs/common';
import { BadRequestError } from 'app/common/response';
import { PRODUCT_ERROR_MESSAGES } from '../product.errors';
import { ProductRepository } from '../repository/product.repository';

@Injectable()
export class GetProductDetailUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(storeId: string, id: string) {
    const product = await this.productRepository.findDetail(storeId, id);

    if (!product) {
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return {
      ...product,
      variant: product.variant.map((item) => ({
        ...item,
        onHand: item.variant_stocks?.[0]?.onHand,
        reserved: item.variant_stocks?.[0]?.reserved,
        damaged: item.variant_stocks?.[0]?.damaged,
      })),
      variant_stocks: undefined,
    };
  }
}
