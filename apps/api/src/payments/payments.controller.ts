import { Controller, Post, Body, HttpCode, HttpStatus, Param, Get } from '@nestjs/common';
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
  @Get('status/:checkoutRequestId')
  async status(@Param('checkoutRequestId') checkoutRequestId: string) {
    const payment = await this.payments.findByCheckoutRequestId(checkoutRequestId);
    return {
      status: payment.status,
      mpesaReceipt: payment.mpesaReceipt,
      amountPaidKsh: payment.amountPaidKsh,
    };
  }

  @Public()
  @Post('callback/:checkoutRequestId')
  async callback(@Param('checkoutRequestId') checkoutRequestId: string, @Body() body: Record<string, unknown>) {
    return { received: true };
  }
}
