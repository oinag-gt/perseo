import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { Enrollment } from './enrollment.entity';
import { Person } from '../../people/entities/person.entity';

export enum GradeType {
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  MIDTERM = 'midterm',
  FINAL = 'final',
  PROJECT = 'project',
  PARTICIPATION = 'participation',
  ATTENDANCE = 'attendance',
  EXTRA_CREDIT = 'extra_credit',
}

export enum GradeScale {
  PERCENTAGE = 'percentage',
  POINTS = 'points',
  LETTER = 'letter',
  PASS_FAIL = 'pass_fail',
}

@Entity('grades')
export class Grade extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: GradeType,
  })
  type: GradeType;

  @Column({
    type: 'enum',
    enum: GradeScale,
    default: GradeScale.PERCENTAGE,
  })
  scale: GradeScale;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  maxScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number;

  @Column({ nullable: true })
  letterGrade?: string;

  @Column({ type: 'boolean', default: false })
  isPassing: boolean;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ type: 'date', nullable: true })
  submissionDate?: Date;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: false })
  isExtraCredit: boolean;

  @Column({ type: 'boolean', default: false })
  isDropped: boolean;

  @Column({ type: 'uuid' })
  @Index()
  enrollmentId: string;

  @ManyToOne(() => Enrollment, enrollment => enrollment.grades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: Enrollment;

  @Column({ type: 'uuid', nullable: true })
  gradedById?: string;

  @ManyToOne(() => Person, { nullable: true })
  @JoinColumn({ name: 'gradedById' })
  gradedBy?: Person;

  @Column({ type: 'timestamp', nullable: true })
  gradedAt?: Date;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  get percentage(): number {
    if (this.maxScore === 0) return 0;
    return (this.score / this.maxScore) * 100;
  }

  get isLate(): boolean {
    if (!this.dueDate || !this.submissionDate) return false;
    return this.submissionDate > this.dueDate;
  }

  get weightedScore(): number {
    if (!this.weight) return this.percentage;
    return this.percentage * (this.weight / 100);
  }
}