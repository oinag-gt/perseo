import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { Enrollment } from './enrollment.entity';
import { Person } from '../../people/entities/person.entity';

export enum CertificateStatus {
  PENDING = 'pending',
  GENERATED = 'generated',
  ISSUED = 'issued',
  REVOKED = 'revoked',
}

export enum CertificateType {
  COMPLETION = 'completion',
  ACHIEVEMENT = 'achievement',
  PARTICIPATION = 'participation',
  PROFICIENCY = 'proficiency',
}

export interface CertificateMetadata {
  templateId?: string;
  customFields?: Record<string, any>;
  digitalSignature?: string;
  verificationCode?: string;
}

@Entity('certificates')
export class Certificate extends BaseEntity {
  @Column({ unique: true })
  @Index()
  certificateNumber: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CertificateType,
    default: CertificateType.COMPLETION,
  })
  type: CertificateType;

  @Column({
    type: 'enum',
    enum: CertificateStatus,
    default: CertificateStatus.PENDING,
  })
  status: CertificateStatus;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate?: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalGrade?: number;

  @Column({ nullable: true })
  gradeScale?: string;

  @Column({ type: 'int', nullable: true })
  creditsEarned?: number;

  @Column({ nullable: true })
  pdfUrl?: string;

  @Column({ nullable: true })
  digitalSignatureUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: CertificateMetadata;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'uuid' })
  @Index()
  enrollmentId: string;

  @ManyToOne(() => Enrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: Enrollment;

  @Column({ type: 'uuid', nullable: true })
  issuedById?: string;

  @ManyToOne(() => Person, { nullable: true })
  @JoinColumn({ name: 'issuedById' })
  issuedBy?: Person;

  @Column({ type: 'timestamp', nullable: true })
  issuedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  revokedById?: string;

  @ManyToOne(() => Person, { nullable: true })
  @JoinColumn({ name: 'revokedById' })
  revokedBy?: Person;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt?: Date;

  @Column({ type: 'text', nullable: true })
  revocationReason?: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  get isValid(): boolean {
    if (this.status === CertificateStatus.REVOKED) return false;
    if (!this.expirationDate) return true;
    return new Date() <= this.expirationDate;
  }

  get isExpired(): boolean {
    if (!this.expirationDate) return false;
    return new Date() > this.expirationDate;
  }

  get verificationUrl(): string {
    return `/verify-certificate/${this.certificateNumber}`;
  }
}