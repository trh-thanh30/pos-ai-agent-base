import type { IUser } from 'app/common/types/user.type';
import type { CreateProductDto } from '../dto/create-product.dto';
import type { UpdateProductDto } from '../dto/update-product.dto';

export interface CreateProductCommand {
  user: IUser;
  storeId: string;
  data: CreateProductDto;
  file?: Express.Multer.File;
}

export interface UpdateProductCommand {
  user: IUser;
  storeId: string;
  productId: string;
  data: UpdateProductDto;
  file?: Express.Multer.File;
}
