import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class DarajaService {
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly shortcode: string;
  private readonly passkey: string;
  private readonly callbackUrl: string;
  private readonly pochiShortcode: string;
  private readonly pochiCallbackUrl: string;

  constructor(private readonly config: ConfigService, private readonly payments: PaymentsService) {
    this.consumerKey = this.config.get<string>('DARAJA_CONSUMER_KEY', '');
    this.consumerSecret = this.config.get<string>('DARAJA_CONSUMER_SECRET', '');
    this.shortcode = this.config.get<string>('DARAJA_SHORTCODE', '');
    this.passkey = this.config.get<string>('DARAJA_PASSKEY', '');
    this.callbackUrl = this.config.get<string>('DARAJA_CALLBACK_URL', '');
    this.pochiShortcode = this.config.get<string>('DARAJA_POCHI_SHORTCODE', '');
    this.pochiCallbackUrl = this.config.get<string>('DARAJA_POCHI_CALLBACK_URL', '');
  }

  async initiateStkPush(phone: string, amountKsh: number, accountReference: string) {
    // This is a simplified implementation
    // In production, you would make an actual HTTP request to Safaricom's Daraja API
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0] + 'Z';
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

    // For now, return a mock response
    // In production, replace with actual fetch/axios call to https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
    return {
      MerchantRequestID: `mock-${Date.now()}`,
      CheckoutRequestID: `ws_CO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      CustomerMessage: 'Success. Request accepted for processing',
    };
  }

  async initiatePochiStkPush(phone: string, amountKsh: number, accountReference: string) {
    // Pochi la Biashara STK Push implementation
    // Similar to regular STK Push but uses the Pochi shortcode
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0] + 'Z';
    const password = Buffer.from(`${this.pochiShortcode}${this.passkey}${timestamp}`).toString('base64');

    // For now, return a mock response
    // In production, replace with actual fetch/axios call to Daraja API with Pochi shortcode
    return {
      MerchantRequestID: `mock-pochi-${Date.now()}`,
      CheckoutRequestID: `ws_CO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      CustomerMessage: 'Success. Request accepted for processing',
    };
  }

  async handleStkCallback(checkoutRequestId: string, callbackData: Record<string, unknown>) {
    const body = callbackData?.Body as Record<string, unknown> | undefined;
    const stkCallback = body?.stkCallback as Record<string, unknown> | undefined;
    const resultCode = stkCallback?.ResultCode as number | undefined;
    const callbackMetadata = (stkCallback?.CallbackMetadata as Record<string, unknown> | undefined)?.Item as Array<Record<string, unknown>> | undefined;

    if (resultCode === 0) {
      const amount = Number(this.extractCallbackValue(callbackMetadata || [], 'Amount'));
      const mpesaReceipt = this.extractCallbackValue(callbackMetadata || [], 'MpesaReceiptNumber');

      await this.payments.markAsPaid(checkoutRequestId, mpesaReceipt, amount);
      return { status: 'success' };
    } else {
      await this.payments.markAsFailed(checkoutRequestId);
      return { status: 'failed', resultCode };
    }
  }

  private extractCallbackValue(items: Array<Record<string, unknown>>, key: string): string {
    const item = items.find((i) => i.Name === key);
    return typeof item?.Value === 'string' ? item.Value : '';
  }
}
