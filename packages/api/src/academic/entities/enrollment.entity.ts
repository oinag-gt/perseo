import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { CourseInstance } from './course-instance.entity';
import { Person } from '../../people/entities/person.entity';

export enum EnrollmentStatus {
  PENDING = 'pending',
  WAITLISTED = 'waitlisted',
  ENROLLED = 'enrolled',
  DROPPED = 'dropped',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  REFUNDED = 'refunded',
}

export interface EnrollmentMetadata {
  enrollmentSource?: string;
  discountCode?: string;
  specialRequirements?: string[];
  emergencyContactOverride?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

@Entity('enrollments')
export class Enrollment extends BaseEntity {
  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING,
  })
  @Index()
  status: EnrollmentStatus;

  @Column({ type: 'date' })
  enrollmentDate: Date;

  @Column({ type: 'date', nullable: true })
  completionDate?: Date;

  @Column({ type: 'date', nullable: true })
  dropDate?: Date;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountPaid?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountDue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount?: number;

  @Column({ type: 'text', nullable: true })
  dropReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: EnrollmentMetadata;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'uuid' })
  @Index()
  studentId: string;

  @ManyToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Person;

  @Column({ type: 'uuid' })
  @Index()
  courseInstanceId: string;

  @ManyToOne(() => CourseInstance, instance => instance.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseInstanceId' })
  courseInstance: CourseInstance;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @OneToMany('Grade', 'enrollment')
  grades: any[];

  @OneToMany('AttendanceRecord', 'enrollment')
  attendanceRecords: any[];

  get finalGrade(): number | null {
    if (!this.grades?.length) return null;
    const finalGrade = this.grades.find((g: any) => g.type === 'final');
    return finalGrade?.score || null;
  }

  get attendancePercentage(): number {
    if (!this.attendanceRecords?.length) return 0;
    const present = this.attendanceRecords.filter((r: any) => r.status === 'present').length;
    return (present / this.attendanceRecords.length) * 100;
  }
}