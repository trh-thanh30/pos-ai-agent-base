import { Injectable } from '@nestjs/common';
import { BadRequestError } from 'app/common/response';
import { PRODUCT_ERROR_MESSAGES } from '../product.errors';
import { ProductRepository } from '../repository/product.repository';

@Injectable()
export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(storeId: string, id: string) {
    const product = await this.productRepository.findActiveById(storeId, id);

    if (!product) {
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return this.productRepository.softDelete(storeId, id);
  }
}
