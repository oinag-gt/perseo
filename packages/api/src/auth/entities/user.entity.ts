import { Entity, Column, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { RefreshToken } from './refresh-token.entity';
import { Tenant } from '../../database/entities/tenant.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  MEMBER = 'member',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpires?: Date;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.MEMBER],
  })
  roles: UserRole[];

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  lastLoginIp?: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  tenantId?: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isLocked(): boolean {
    return this.lockedUntil ? this.lockedUntil > new Date() : false;
  }
}