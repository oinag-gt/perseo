import { Entity, Column, ManyToOne, Index, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Tenant } from './tenant.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('audit_logs')
@Index(['tenantId', 'createdAt'])
@Index(['userId', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 100, nullable: true })
  entityType?: string;

  @Column({ type: 'uuid', nullable: true })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues?: Record<string, any>;

  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  tenant?: Tenant;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user?: User;
}