import { Injectable } from '@nestjs/common';
import { PrismaService } from 'app/prisma/prisma.service';

@Injectable()
export class AssetLinksRepository {
  constructor(private readonly prisma: PrismaService) {}

  link(input: {
    storeId: string;
    assetId: string;
    entityId: string;
    entityType: string;
  }) {
    return this.prisma.assetLink.upsert({
      where: {
        asset_id_entity_id_entity_type: {
          asset_id: input.assetId,
          entity_id: input.entityId,
          entity_type: input.entityType,
        },
      },
      update: {},
      create: {
        store_id: input.storeId,
        asset_id: input.assetId,
        entity_id: input.entityId,
        entity_type: input.entityType,
      },
    });
  }

  listByEntity(input: {
    storeId: string;
    entityId: string;
    entityType: string;
  }) {
    return this.prisma.assetLink.findMany({
      where: {
        store_id: input.storeId,
        entity_id: input.entityId,
        entity_type: input.entityType,
        asset: { is_deleted: false },
      },
      include: { asset: true },
      orderBy: { created_at: 'desc' },
    });
  }

  unlink(input: {
    storeId: string;
    assetId: string;
    entityId: string;
    entityType: string;
  }) {
    return this.prisma.assetLink.deleteMany({
      where: {
        store_id: input.storeId,
        asset_id: input.assetId,
        entity_id: input.entityId,
        entity_type: input.entityType,
      },
    });
  }

  replaceEntityAssets(input: {
    storeId: string;
    entityId: string;
    entityType: string;
    assetIds: string[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      await tx.assetLink.deleteMany({
        where: {
          store_id: input.storeId,
          entity_id: input.entityId,
          entity_type: input.entityType,
        },
      });

      if (input.assetIds.length === 0) {
        return [];
      }

      await tx.assetLink.createMany({
        data: input.assetIds.map((assetId) => ({
          store_id: input.storeId,
          asset_id: assetId,
          entity_id: input.entityId,
          entity_type: input.entityType,
        })),
        skipDuplicates: true,
      });

      return tx.assetLink.findMany({
        where: {
          store_id: input.storeId,
          entity_id: input.entityId,
          entity_type: input.entityType,
        },
        include: { asset: true },
        orderBy: { created_at: 'desc' },
      });
    });
  }
}
