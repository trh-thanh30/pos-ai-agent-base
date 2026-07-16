import { Injectable } from '@nestjs/common';
import { Prisma, asset_access_type } from '@prisma/client';
import { PrismaService } from 'app/prisma/prisma.service';
import { ListAssetsDto } from '../dto/list-assets.dto';

@Injectable()
export class AssetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AssetCreateInput) {
    return this.prisma.asset.create({ data });
  }

  findById(id: string) {
    return this.prisma.asset.findUnique({ where: { id } });
  }

  list(dto: ListAssetsDto) {
    const {
      page = 1,
      limit = 10,
      uploadedById,
      type,
      accessType,
      folder,
    } = dto;
    const skip = (page - 1) * limit;
    const where: Prisma.AssetWhereInput = {
      is_deleted: false,
      uploaded_by_id: uploadedById,
      type,
      access_type: accessType,
      folder: folder ? { contains: folder } : undefined,
    };

    return this.prisma.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.asset.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        tx.asset.count({ where }),
      ]);

      return { items, total, page, limit };
    });
  }

  markDeleted(id: string) {
    return this.prisma.asset.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  findExpiredTempAssets(before: Date) {
    return this.prisma.asset.findMany({
      where: {
        access_type: asset_access_type.TEMP,
        created_at: { lt: before },
        is_deleted: false,
      },
    });
  }
}
