import {
  Controller,
  Delete,
  Get,
  Body,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'app/common/decorators/roles.decorator';
import { User } from 'app/common/decorators/user.decorator';
import { type IUser } from 'app/common/types/user.type';
import { ListAssetsDto } from 'app/module/assets/dto/list-assets.dto';
import { JwtAuthGuard } from 'app/module/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'app/module/auth/guards/roles.guard';
import { type Response } from 'express';
import { LinkAssetDto } from './dto/link-asset.dto';
import { ReplaceEntityAssetsDto } from './dto/replace-entity-assets.dto';
import { UploadAssetDto } from './dto/upload-asset.dto';
import { AssetEntityType } from './types/asset-entity.type';
import { DeleteAssetUseCase } from './use-cases/delete-asset.use-case';
import { GetAssetDetailUseCase } from './use-cases/get-asset-detail.use-case';
import { LinkAssetToEntityUseCase } from './use-cases/link-asset-to-entity.use-case';
import { ListAssetsUseCase } from './use-cases/list-assets.use-case';
import { ListEntityAssetsUseCase } from './use-cases/list-entity-assets.use-case';
import { ReplaceEntityAssetsUseCase } from './use-cases/replace-entity-assets.use-case';
import { StreamPrivateAssetUseCase } from './use-cases/stream-private-asset.use-case';
import { UnlinkAssetFromEntityUseCase } from './use-cases/unlink-asset-from-entity.use-case';
import { UploadAssetUseCase } from './use-cases/upload-asset.use-case';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(
    private readonly uploadAssetUseCase: UploadAssetUseCase,
    private readonly getAssetDetailUseCase: GetAssetDetailUseCase,
    private readonly listAssetsUseCase: ListAssetsUseCase,
    private readonly deleteAssetUseCase: DeleteAssetUseCase,
    private readonly streamPrivateAssetUseCase: StreamPrivateAssetUseCase,
    private readonly linkAssetToEntityUseCase: LinkAssetToEntityUseCase,
    private readonly listEntityAssetsUseCase: ListEntityAssetsUseCase,
    private readonly unlinkAssetFromEntityUseCase: UnlinkAssetFromEntityUseCase,
    private readonly replaceEntityAssetsUseCase: ReplaceEntityAssetsUseCase,
  ) {}

  /**
   * Upload a file
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @User() user: IUser,
    @UploadedFile() file: Express.Multer.File,
    @Query() dto: UploadAssetDto,
  ) {
    return this.uploadAssetUseCase.execute(user, file, dto);
  }

  /**
   * Get asset metadata
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getAssetDetailUseCase.execute(id);
  }

  /**
   * List all assets (Admin only)
   */
  @Get()
  @Roles(['ADMIN'])
  async findAll(@Query() dto: ListAssetsDto) {
    return this.listAssetsUseCase.execute(dto);
  }

  @Get('entities/:entityType/:entityId')
  async findByEntity(
    @User() user: IUser,
    @Param('entityType', new ParseEnumPipe(AssetEntityType))
    entityType: AssetEntityType,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.listEntityAssetsUseCase.execute({
      storeId: user.storeId || '',
      entityType,
      entityId,
    });
  }

  @Post(':id/link')
  async linkToEntity(
    @User() user: IUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LinkAssetDto,
  ) {
    return this.linkAssetToEntityUseCase.execute(user, {
      assetId: id,
      entityId: dto.entityId,
      entityType: dto.entityType,
    });
  }

  @Delete(':id/link')
  async unlinkFromEntity(
    @User() user: IUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LinkAssetDto,
  ) {
    return this.unlinkAssetFromEntityUseCase.execute(user, {
      assetId: id,
      entityId: dto.entityId,
      entityType: dto.entityType,
    });
  }

  @Put('entities/:entityType/:entityId')
  async replaceEntityAssets(
    @User() user: IUser,
    @Param('entityType', new ParseEnumPipe(AssetEntityType))
    entityType: AssetEntityType,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Body() dto: ReplaceEntityAssetsDto,
  ) {
    return this.replaceEntityAssetsUseCase.execute(user, {
      entityType,
      entityId,
      assetIds: dto.assetIds,
    });
  }

  /**
   * Delete an asset
   */
  @Delete(':id')
  async remove(@User() user: IUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.deleteAssetUseCase.execute(id, user);
  }

  /**
   * Stream a private file
   */
  @Get('private/:id/stream')
  async streamPrivate(
    @User() user: IUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { stream, asset } = await this.streamPrivateAssetUseCase.execute(
      id,
      user,
    );

    res.set({
      'Content-Type': asset.mime_type,
      'Content-Disposition': `inline; filename="${asset.original_name}"`,
    });

    stream.pipe(res);
  }
}
