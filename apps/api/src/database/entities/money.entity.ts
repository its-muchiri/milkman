import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id', type: 'uuid', unique: true })
  customerId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

/**
 * Append-only ledger. The balance is SUM(delta_ksh) — never stored alone.
 * A DB trigger rejects UPDATE/DELETE on this table.
 */
@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId: string;

  @Column({ name: 'txn_type', type: 'enum', enum: ['top_up', 'purchase', 'refund', 'adjustment'] })
  txnType: 'top_up' | 'purchase' | 'refund' | 'adjustment';

  /** +credit / −debit in KSh. */
  @Column({ name: 'delta_ksh', type: 'integer' })
  deltaKsh: number;

  @Column({ name: 'mpesa_receipt', type: 'text', nullable: true })
  mpesaReceipt: string | null;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  /** Convenience cache; source of truth remains SUM(delta_ksh). */
  @Column({ name: 'balance_after_ksh', type: 'integer' })
  balanceAfterKsh: number;

  /** Duplicate M-Pesa callbacks can never double-credit. */
  @Column({ name: 'idempotency_key', type: 'text', nullable: true, unique: true })
  idempotencyKey: string | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({ name: 'wallet_topup', default: false })
  walletTopup: boolean;

  @Column({ type: 'enum', enum: ['mpesa_stk', 'mpesa_till', 'wallet', 'cash_on_delivery'] })
  method: 'mpesa_stk' | 'mpesa_till' | 'wallet' | 'cash_on_delivery';

  @Column({ type: 'enum', enum: ['pending', 'paid', 'partially_paid', 'failed', 'refunded', 'expired'], default: 'pending' })
  status: 'pending' | 'paid' | 'partially_paid' | 'failed' | 'refunded' | 'expired';

  @Column({ name: 'amount_ksh', type: 'integer' })
  amountKsh: number;

  @Column({ name: 'amount_paid_ksh', type: 'integer', default: 0 })
  amountPaidKsh: number;

  @Column({ type: 'text' })
  phone: string;

  @Column({ name: 'mpesa_receipt', type: 'text', nullable: true, unique: true })
  mpesaReceipt: string | null;

  @Column({ name: 'checkout_request_id', type: 'text', nullable: true, unique: true })
  checkoutRequestId: string | null;

  @Column({ name: 'callback_payload', type: 'jsonb', nullable: true })
  callbackPayload: Record<string, unknown> | null;

  @Column({ default: false })
  reconciled: boolean;

  @Column({ name: 'requested_at', type: 'timestamptz', default: () => 'now()' })
  requestedAt: Date;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;
}

@Entity('audit_log')
export class AuditLogEntry {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null;

  @Column({ type: 'text' })
  action: string;

  @Column({ name: 'entity_type', type: 'text' })
  entityType: string;

  @Column({ name: 'entity_id', type: 'text' })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  before: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  after: Record<string, unknown> | null;

  @Column({ type: 'inet', nullable: true })
  ip: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('settings')
export class Setting {
  @PrimaryColumn({ type: 'text' })
  key: string;

  @Column({ type: 'jsonb' })
  value: Record<string, unknown>;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;
}
