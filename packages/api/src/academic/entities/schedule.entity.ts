import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { CourseInstance } from './course-instance.entity';

export enum ScheduleType {
  CLASS = 'class',
  EXAM = 'exam',
  WORKSHOP = 'workshop',
  FIELD_TRIP = 'field_trip',
  HOLIDAY = 'holiday',
  MAKEUP = 'makeup',
}

export enum ScheduleStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  RESCHEDULED = 'rescheduled',
}

@Entity('schedules')
export class Schedule extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ScheduleType,
    default: ScheduleType.CLASS,
  })
  type: ScheduleType;

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.SCHEDULED,
  })
  status: ScheduleStatus;

  @Column({ type: 'timestamp' })
  startDateTime: Date;

  @Column({ type: 'timestamp' })
  endDateTime: Date;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  room?: string;

  @Column({ type: 'text', nullable: true })
  agenda?: string;

  @Column({ type: 'text', nullable: true })
  materials?: string;

  @Column({ type: 'text', nullable: true })
  homework?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ type: 'uuid', nullable: true })
  originalScheduleId?: string;

  @ManyToOne(() => Schedule, { nullable: true })
  @JoinColumn({ name: 'originalScheduleId' })
  originalSchedule?: Schedule;

  @Column({ type: 'uuid' })
  @Index()
  courseInstanceId: string;

  @ManyToOne(() => CourseInstance, instance => instance.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseInstanceId' })
  courseInstance: CourseInstance;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  get duration(): number {
    return Math.abs(this.endDateTime.getTime() - this.startDateTime.getTime()) / (1000 * 60);
  }

  get isToday(): boolean {
    const today = new Date();
    const scheduleDate = new Date(this.startDateTime);
    return (
      today.getDate() === scheduleDate.getDate() &&
      today.getMonth() === scheduleDate.getMonth() &&
      today.getFullYear() === scheduleDate.getFullYear()
    );
  }
}