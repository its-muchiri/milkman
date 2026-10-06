import { Controller, Post, Body, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { Public } from '../auth/auth.decorators';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePaymentDto) {
    return this.payments.create(dto);
  }

  @Public()
  @Post('callback/:checkoutRequestId')
  async callback(@Param('checkoutRequestId') checkoutRequestId: string, @Body() body: Record<string, unknown>) {
    // This endpoint will be called by M-Pesa Daraja with the payment result
    // The actual implementation will be in the daraja module, but we provide a basic structure here
    return { received: true };
  }
}
