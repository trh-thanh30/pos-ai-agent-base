import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { User } from 'app/common/decorators/user.decorator';
import { ApiSuccess } from 'app/common/decorators';
import { Public } from 'app/common/decorators/public.decorator';
import { PermissionGuard } from 'app/permissions/guard/permission.guard';
import { RequirePermissions } from 'app/common/decorators/permission.decorator';
import { PERMISSIONS } from 'app/common/types/permission.type';
import type { IUser } from 'app/common/types/user.type';
import { Throttle } from '@nestjs/throttler';
import { CreateStorefrontOrderDto } from './dto/create-storefront-order.dto';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @ApiSuccess('Tạo cửa hàng thành công!')
  create(@Body() createStoreDto: CreateStoreDto, @User() user: IUser) {
    return this.storeService.create(createStoreDto, user);
  }

  @Get()
  @ApiSuccess('Get stores successfully')
  findAll(@User() user: IUser) {
    return this.storeService.findAll(user);
  }

  @Get('subdomain/validate')
  @ApiSuccess('Kiểm tra subdomain thành công!')
  validateSubdomain(
    @Query('subdomain') subdomain: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.storeService.validateSubdomain(subdomain, storeId);
  }

  @Public()
  @Get('subdomain/:subdomain')
  @ApiSuccess('Lấy thông tin cửa hàng theo subdomain thành công!')
  getStoreBySubdomain(
    @Param('subdomain') subdomain: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.storeService.getStoreBySubdomain(subdomain, { page, limit });
  }

  @Public()
  @Get('subdomain/:subdomain/products/:productId')
  @ApiSuccess('Lấy chi tiết sản phẩm cửa hàng thành công!')
  getStorefrontProduct(
    @Param('subdomain') subdomain: string,
    @Param('productId') productId: string,
  ) {
    return this.storeService.getStorefrontProduct(subdomain, productId);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('subdomain/:subdomain/orders')
  @ApiSuccess('Tạo đơn hàng từ website thành công!')
  createStorefrontOrder(
    @Param('subdomain') subdomain: string,
    @Body() dto: CreateStorefrontOrderDto,
  ) {
    return this.storeService.createStorefrontOrder(subdomain, dto);
  }

  @Get(':storeId')
  @UseGuards(PermissionGuard)
  @RequirePermissions([PERMISSIONS.STORE_READ])
  @ApiSuccess('Lấy thông tin cửa hàng thành công!')
  findOne(@Param('storeId') storeId: string, @User() user: IUser) {
    return this.storeService.findOne(storeId, user);
  }

  @Patch(':storeId')
  @UseGuards(PermissionGuard)
  @RequirePermissions([PERMISSIONS.STORE_UPDATE, PERMISSIONS.STORE_ALL])
  @ApiSuccess('Cập nhật cửa hàng thành công!')
  update(
    @Param('storeId') storeId: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @User() user: IUser,
  ) {
    return this.storeService.update(storeId, updateStoreDto, user);
  }

  @Delete(':storeId')
  @ApiSuccess('Xoá cửa hàng thành công!')
  @UseGuards(PermissionGuard)
  @RequirePermissions([PERMISSIONS.STORE_DELETE, PERMISSIONS.STORE_ALL])
  remove(@Param('storeId') storeId: string, @User() user: IUser) {
    return this.storeService.remove(storeId, user);
  }
  // Get Permissions
  @Get('members/permissions/:storeId')
  @ApiSuccess('Get permissions in store successfully')
  getPermissionsInStore(
    @Param('storeId') storeId: string,
    @User() user: IUser,
  ) {
    return this.storeService.getPermissionsInStore(storeId, user);
  }
}
