import { payment_method, Prisma } from '@prisma/client';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class AcceptPaymentPurchaseReturnDto {
  @IsNotEmpty({
    message: 'Vui lòng chọn hình thức thanh toán',
  })
  payment_method: payment_method;
  @IsNotEmpty({
    message: 'Vui lòng nhập số tiền thanh toán',
  })
  amount: Prisma.Decimal;
  @IsOptional()
  payment_date?: Date;
  @IsOptional()
  reference?: string;
  @IsOptional()
  notes?: string;
}
