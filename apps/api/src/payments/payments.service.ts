import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../database/entities/money.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  async create(dto: CreatePaymentDto) {
    if (dto.amountKsh < 1) {
      throw new BadRequestException('Amount must be at least 1 KSh.');
    }

    const payment = this.repo.create({
      method: dto.method,
      amountKsh: dto.amountKsh,
      amountPaidKsh: 0,
      phone: dto.phone.trim(),
      orderId: dto.orderId || null,
      checkoutRequestId: dto.checkoutRequestId || null,
      status: 'pending',
      reconciled: false,
    });

    const saved = await this.repo.save(payment);

    return {
      reference: saved.id,
      checkoutRequestId: saved.checkoutRequestId,
    };
  }

  async findByCheckoutRequestId(checkoutRequestId: string) {
    const payment = await this.repo.findOne({
      where: { checkoutRequestId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    return payment;
  }

  async markAsPaid(checkoutRequestId: string, mpesaReceipt: string, amountPaidKsh: number) {
    const payment = await this.findByCheckoutRequestId(checkoutRequestId);

    payment.status = 'paid';
    payment.mpesaReceipt = mpesaReceipt;
    payment.amountPaidKsh = amountPaidKsh;
    payment.paidAt = new Date();

    return this.repo.save(payment);
  }

  async markAsFailed(checkoutRequestId: string) {
    const payment = await this.findByCheckoutRequestId(checkoutRequestId);

    payment.status = 'failed';

    return this.repo.save(payment);
  }
}
