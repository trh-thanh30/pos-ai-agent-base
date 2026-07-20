import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { PrismaService } from 'app/prisma/prisma.service';
import { PermissionService } from 'app/permissions/permission.service';
import { StoreAdminController } from './store-admin.controller';
import { StockMovementModule } from 'app/module/stock-movement/stock-movement.module';
import { ApplyStockUseCase } from 'app/module/variant/use-case/apply-stock.usecase';
import { GenerateOrderCodeUseCase } from 'app/module/orders/use-case/generate-order-code.usecase';

@Module({
  imports: [StockMovementModule],
  controllers: [StoreController, StoreAdminController],
  providers: [
    StoreService,
    PrismaService,
    PermissionService,
    ApplyStockUseCase,
    GenerateOrderCodeUseCase,
  ],
  exports: [StoreService],
})
export class StoreModule {}
