import { IsString, IsInt, IsOptional, IsIn, Min } from 'class-validator';
import { PaymentMethod } from '@milkman/shared';

const PAYMENT_METHODS: PaymentMethod[] = ['mpesa_stk', 'mpesa_till', 'wallet', 'cash_on_delivery'];

export class CreatePaymentDto {
  @IsIn(PAYMENT_METHODS)
  method: PaymentMethod;

  @IsInt()
  @Min(1)
  amountKsh: number;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  checkoutRequestId?: string;
}
