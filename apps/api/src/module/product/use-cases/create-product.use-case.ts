import { Injectable } from '@nestjs/common';
import { stock_movement_type } from '@prisma/client';
import { AssetEntityType } from 'app/module/assets/types/asset-entity.type';
import { UploadAssetUseCase } from 'app/module/assets/use-cases/upload-asset.use-case';
import { StockMovementService } from 'app/module/stock-movement/stock-movement.service';
import { GenerateVariantSkuUseCase } from 'app/module/variant/use-case/genereate-sku-variant.usecase';
import { ProductRepository } from '../repository/product.repository';
import type { CreateProductCommand } from '../types/product-command.type';
import { ProductValidatorUtil } from '../utils/product-validator.util';
import { GenerateProductSkuUseCase } from './generate-product-sku.use-case';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productValidator: ProductValidatorUtil,
    private readonly generateProductSkuUseCase: GenerateProductSkuUseCase,
    private readonly generateVariantSkuUseCase: GenerateVariantSkuUseCase,
    private readonly stockMovementService: StockMovementService,
    private readonly uploadAssetUseCase: UploadAssetUseCase,
  ) {}

  async execute(command: CreateProductCommand) {
    const { user, storeId, data, file } = command;

    return this.productRepository.transaction(async (tx) => {
      const generatedSku =
        await this.generateProductSkuUseCase.generateSku(storeId);
      const skuToUse =
        data.sku && data.sku.trim() !== '' ? data.sku : generatedSku;

      await this.productValidator.ensureSkuAvailable(skuToUse, storeId);

      const { categoryIds, tagIds, quantity, cost, price, barcode, ...body } =
        data;

      const newProduct = await this.productRepository.createQuickProduct(tx, {
        data: {
          ...body,
          sku: skuToUse,
        },
        storeId,
        createdBy: user.id,
        categoryIds,
        tagIds,
      });

      let imageUrl = newProduct.image_url;
      if (file) {
        const asset = await this.uploadAssetUseCase.execute(user, file, {
          entityId: newProduct.id,
          entityType: AssetEntityType.PRODUCT,
          folder: 'products',
        });
        imageUrl = asset.url;
        await this.productRepository.updateProductImage(
          tx,
          newProduct.id,
          imageUrl,
        );
      }

      if (barcode && barcode.trim() !== '') {
        await this.productValidator.ensureBarcodeAvailable(barcode, storeId);
      }

      const newVariant = await this.productRepository.createVariant(tx, {
        product_id: newProduct.id,
        name: newProduct.name,
        sku: await this.generateVariantSkuUseCase.generateSkuVariant(storeId),
        price: price || 0,
        cost: cost || 0,
        barcode: barcode || '',
      });

      await this.productRepository.createVariantStock(tx, {
        variant_id: newVariant.id,
        onHand: quantity || 0,
        store_id: storeId,
      });

      if (quantity !== 0) {
        await this.stockMovementService.create(
          newVariant.id,
          stock_movement_type.ADJUSTMENT,
          quantity || 0,
          tx,
        );
      }

      return {
        ...newVariant,
        product: {
          baseUnit: newProduct.baseUnit,
          image_url: imageUrl,
        },
      };
    });
  }
}
