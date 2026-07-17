import { Injectable } from '@nestjs/common';
import { BadRequestError } from 'app/common/response';
import { PRODUCT_ERROR_MESSAGES } from '../product.errors';
import { ProductRepository } from '../repository/product.repository';

@Injectable()
export class ProductValidatorUtil {
  constructor(private readonly productRepository: ProductRepository) {}

  async ensureProductExists(productId: string, storeId: string) {
    const product = await this.productRepository.findActiveById(
      storeId,
      productId,
    );

    if (!product) {
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return product;
  }

  async ensureSkuAvailable(sku: string, storeId: string, productId?: string) {
    const product = await this.productRepository.findBySku(
      storeId,
      sku,
      productId,
    );

    if (product) {
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_SKU_EXISTS);
    }
  }

  async ensureBarcodeAvailable(
    barcode: string,
    storeId: string,
    productId?: string,
  ) {
    const variant = await this.productRepository.findVariantByBarcode(
      storeId,
      barcode,
      productId,
    );

    if (variant) {
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.BARCODE_ALREADY_EXISTS);
    }
  }
}
