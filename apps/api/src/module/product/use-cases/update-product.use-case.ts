import { Injectable } from '@nestjs/common';
import { AssetEntityType } from 'app/module/assets/types/asset-entity.type';
import { UploadAssetUseCase } from 'app/module/assets/use-cases/upload-asset.use-case';
import { ProductRepository } from '../repository/product.repository';
import type { UpdateProductCommand } from '../types/product-command.type';
import { ProductValidatorUtil } from '../utils/product-validator.util';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productValidator: ProductValidatorUtil,
    private readonly uploadAssetUseCase: UploadAssetUseCase,
  ) {}

  async execute(command: UpdateProductCommand) {
    const { user, storeId, productId, data, file } = command;

    await this.productValidator.ensureProductExists(productId, storeId);

    if (data.sku) {
      await this.productValidator.ensureSkuAvailable(
        data.sku,
        storeId,
        productId,
      );
    }

    const { categoryIds, tagIds, barcode, ...productData } = data;

    let imageUrl = productData.image_url;
    if (file) {
      const asset = await this.uploadAssetUseCase.execute(user, file, {
        entityId: productId,
        entityType: AssetEntityType.PRODUCT,
        folder: 'products',
      });
      imageUrl = asset.url;
    }

    const updated = await this.productRepository.updateProduct(
      storeId,
      productId,
      {
        ...productData,
        image_url: imageUrl,
        categories:
          categoryIds !== undefined
            ? {
                set: categoryIds.map((id) => ({ id })),
              }
            : undefined,
        tags:
          tagIds !== undefined
            ? {
                set: tagIds.map((id) => ({ id })),
              }
            : undefined,
      },
    );

    if (barcode && barcode.trim() !== '') {
      await this.productValidator.ensureBarcodeAvailable(
        barcode,
        storeId,
        productId,
      );

      const firstVariant =
        await this.productRepository.findFirstVariant(productId);
      if (firstVariant) {
        await this.productRepository.updateVariantBarcode(
          firstVariant.id,
          barcode,
        );
      }
    }

    return updated;
  }
}
