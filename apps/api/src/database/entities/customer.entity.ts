import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  /** Normalized +254 E.164. */
  @Column()
  phone: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ name: 'consent_marketing', default: false })
  consentMarketing: boolean;

  @Column({ name: 'consent_at', type: 'timestamptz', nullable: true })
  consentAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string | null;

  @Column({ type: 'text', nullable: true })
  label: string | null;

  @Column({ type: 'text', nullable: true })
  landmark: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /** GeoJSON Point as returned/accepted by PostGIS via TypeORM. */
  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  point: { type: 'Point'; coordinates: [number, number] };

  @Column({ name: 'distance_m', type: 'integer' })
  distanceM: number;

  @Column({ type: 'enum', enum: ['bicycle', 'motorcycle', 'out_of_zone'] })
  zone: 'bicycle' | 'motorcycle' | 'out_of_zone';

  @Column({ type: 'enum', enum: ['bicycle', 'motorcycle'], nullable: true })
  vehicle: 'bicycle' | 'motorcycle' | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  name: string | null;

  @Column({ type: 'text', nullable: true })
  phone: string | null;

  @Column({ type: 'enum', enum: ['website', 'whatsapp', 'call', 'admin', 'subscription'], default: 'website' })
  source: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @Column({ name: 'converted_to_customer_id', type: 'uuid', nullable: true })
  convertedToCustomerId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
