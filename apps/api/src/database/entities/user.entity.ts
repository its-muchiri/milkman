import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type UserRole = 'admin' | 'rider';
export type AdminPermission = 'depot' | 'finance';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['admin', 'rider'] })
  role: UserRole;

  @Column()
  name: string;

  @Column({ type: 'citext', nullable: true, unique: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  phone: string | null;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'admin_perms', type: 'enum', enum: ['depot', 'finance'], array: true, default: '{}' })
  adminPerms: AdminPermission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
