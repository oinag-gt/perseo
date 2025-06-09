import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { CourseInstance } from './course-instance.entity';
import { Enrollment } from './enrollment.entity';
import { Schedule } from './schedule.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  PARTIAL = 'partial',
}

@Entity('attendance_records')
export class AttendanceRecord extends BaseEntity {
  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
  })
  status: AttendanceStatus;

  @Column({ type: 'timestamp', nullable: true })
  checkInTime?: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOutTime?: Date;

  @Column({ type: 'int', nullable: true })
  minutesLate?: number;

  @Column({ type: 'int', nullable: true })
  minutesPresent?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  excuseReason?: string;

  @Column({ type: 'uuid', nullable: true })
  recordedById?: string;

  @Column({ type: 'timestamp', nullable: true })
  recordedAt?: Date;

  @Column({ type: 'uuid' })
  @Index()
  enrollmentId: string;

  @ManyToOne(() => Enrollment, enrollment => enrollment.attendanceRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: Enrollment;

  @Column({ type: 'uuid' })
  @Index()
  courseInstanceId: string;

  @ManyToOne(() => CourseInstance, instance => instance.attendanceRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseInstanceId' })
  courseInstance: CourseInstance;

  @Column({ type: 'uuid', nullable: true })
  scheduleId?: string;

  @ManyToOne(() => Schedule, { nullable: true })
  @JoinColumn({ name: 'scheduleId' })
  schedule?: Schedule;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  get isPresent(): boolean {
    return this.status === AttendanceStatus.PRESENT || this.status === AttendanceStatus.LATE;
  }

  get isExcused(): boolean {
    return this.status === AttendanceStatus.EXCUSED;
  }
}