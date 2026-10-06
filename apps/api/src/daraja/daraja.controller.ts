import { Controller, Post, Body, HttpCode, HttpStatus, Param, Headers } from '@nestjs/common';
import { Public } from '../auth/auth.decorators';
import { DarajaService } from './daraja.service';

@Controller('daraja')
export class DarajaController {
  constructor(private readonly daraja: DarajaService) {}

  @Public()
  @Post('stk-push')
  @HttpCode(HttpStatus.OK)
  async stkPush(@Body() body: { phone: string; amount: number; accountReference: string }) {
    const result = await this.daraja.initiateStkPush(body.phone, body.amount, body.accountReference);
    return result;
  }

  @Public()
  @Post('stk-push/pochi')
  @HttpCode(HttpStatus.OK)
  async pochiStkPush(@Body() body: { phone: string; amount: number; accountReference: string }) {
    const result = await this.daraja.initiatePochiStkPush(body.phone, body.amount, body.accountReference);
    return result;
  }

  @Public()
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async callback(@Body() body: Record<string, unknown>) {
    const stkCallback = (body?.Body as Record<string, unknown> | undefined)?.stkCallback as Record<string, unknown> | undefined;
    const checkoutRequestId = stkCallback?.CheckoutRequestID as string | undefined;
    if (!checkoutRequestId) {
      return { status: 'ignored' };
    }

    return this.daraja.handleStkCallback(checkoutRequestId, body);
  }

  @Public()
  @Post('pochi-callback')
  @HttpCode(HttpStatus.OK)
  async pochiCallback(@Body() body: Record<string, unknown>) {
    const stkCallback = (body?.Body as Record<string, unknown> | undefined)?.stkCallback as Record<string, unknown> | undefined;
    const checkoutRequestId = stkCallback?.CheckoutRequestID as string | undefined;
    if (!checkoutRequestId) {
      return { status: 'ignored' };
    }

    return this.daraja.handleStkCallback(checkoutRequestId, body);
  }
}
