import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntry } from '../database/entities/money.entity';

export interface AuditWrite {
  actorId: string | null;
  action: string;              // e.g. 'order.status_changed', 'order.amount_edited'
  entityType: string;          // 'orders' | 'payments' | 'subscriptions' | ...
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string | null;
}

/**
 * Spec: "Every status change and every admin edit to money or orders is
 * written to audit_log." Services must go through this — never insert
 * into audit_log by hand. Audit writes never fail the business operation:
 * if the audit insert itself fails it is logged loudly and swallowed.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLogEntry)
    private readonly repo: Repository<AuditLogEntry>,
  ) {}

  async write(entry: AuditWrite): Promise<void> {
    try {
      await this.repo.save(
        this.repo.create({
          actorId: entry.actorId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          before: entry.before ?? null,
          after: entry.after ?? null,
          ip: entry.ip ?? null,
        }),
      );
    } catch (err) {
      this.logger.error(
        `AUDIT WRITE FAILED for ${entry.action} on ${entry.entityType}/${entry.entityId}: ${
          (err as Error).message
        }`,
      );
    }
  }
}
