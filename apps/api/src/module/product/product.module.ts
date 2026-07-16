import { Module } from '@nestjs/common';
import { Format } from 'app/common/helpers/format';
import { ProductExcelService } from 'app/module/product/product-excel.service';
import { PermissionService } from 'app/permissions/permission.service';
import { ExcelTemplateService } from 'app/shared/excel-template/excel-template.service';
import { AssetsModule } from '../assets/assets.module';
import { StockMovementModule } from '../stock-movement/stock-movement.module';
import { GenerateVariantSkuUseCase } from '../variant/use-case/genereate-sku-variant.usecase';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './repository/product.repository';
import { DeleteProductUseCase } from './use-cases/delete-product.use-case';
import { FilterProductsUseCase } from './use-cases/filter-products.use-case';
import { GenerateProductSkuUseCase } from './use-cases/generate-product-sku.use-case';
import { GetProductDetailUseCase } from './use-cases/get-product-detail.use-case';

@Module({
  controllers: [ProductController],
  imports: [StockMovementModule, AssetsModule],
  providers: [
    ProductService,
    ProductRepository,
    PermissionService,
    GenerateProductSkuUseCase,
    GenerateVariantSkuUseCase,
    FilterProductsUseCase,
    GetProductDetailUseCase,
    DeleteProductUseCase,
    ProductExcelService,
    ExcelTemplateService,
    Format,
  ],
})
export class ProductModule {}
