import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductRepository } from '../repository/product.repository';

@Injectable()
export class FilterProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(storeId: string, query: Prisma.ProductFindManyArgs) {
    return this.productRepository.filter(storeId, query);
  }
}
