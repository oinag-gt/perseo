import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column({ unique: true })
  @Index()
  subdomain: string;

  @Column({ unique: true })
  schemaName: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, any>;

  @Column({ nullable: true })
  contactEmail?: string;

  @Column({ nullable: true })
  contactPhone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  logoUrl?: string;

  @Column({ type: 'int', default: 0 })
  userLimit: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;
}