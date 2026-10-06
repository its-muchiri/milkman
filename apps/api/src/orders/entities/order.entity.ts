import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '@milkman/shared';
import { PaymentStatus } from '@milkman/shared';
import { OrderSource } from '@milkman/shared';

@Entity('orders')
export class Order {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'text' })
  customerName: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'int' })
  packs: number;

  @Column({ type: 'int' })
  total: number;

  @Column({ type: 'text' })
  location: string;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'text', default: 'new' })
  status: OrderStatus;

  @Column({ type: 'text', default: 'pending' })
  paymentStatus: PaymentStatus;

  @Column({ type: 'text', default: 'website' })
  source: OrderSource;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
