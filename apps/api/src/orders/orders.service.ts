import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { PACK_PRICE_KSH } from '@milkman/shared';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  async create(dto: CreateOrderDto) {
    if (dto.packs < 1) {
      throw new BadRequestException('At least one pack is required.');
    }

    const total = dto.packs * PACK_PRICE_KSH;

    const order = this.repo.create({
      customerName: dto.customerName.trim(),
      phone: dto.phone.trim(),
      packs: dto.packs,
      total,
      location: dto.location.trim(),
      note: dto.note?.trim() || null,
      status: 'new',
      paymentStatus: 'pending',
      source: 'website',
    });

    const saved = await this.repo.save(order);

    return {
      reference: saved.id,
    };
  }
}
