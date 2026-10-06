import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'pack_size_ml', default: 500 })
  packSizeMl: number;

  @Column({ name: 'is_pack_based', default: true })
  isPackBased: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}

@Entity('addons')
export class Addon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'price_ksh', type: 'integer' })
  priceKsh: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
