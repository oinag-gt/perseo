import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { Course } from './course.entity';
import { Person } from '../../people/entities/person.entity';

export enum CourseInstanceStatus {
  PLANNED = 'planned',
  ENROLLMENT_OPEN = 'enrollment_open',
  ENROLLMENT_CLOSED = 'enrollment_closed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface ScheduleInfo {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
}

@Entity('course_instances')
export class CourseInstance extends BaseEntity {
  @Column()
  @Index()
  name: string;

  @Column({ unique: true })
  @Index()
  code: string;

  @Column({
    type: 'enum',
    enum: CourseInstanceStatus,
    default: CourseInstanceStatus.PLANNED,
  })
  status: CourseInstanceStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'date' })
  enrollmentStartDate: Date;

  @Column({ type: 'date' })
  enrollmentEndDate: Date;

  @Column({ type: 'int', nullable: true })
  maxStudents?: number;

  @Column({ type: 'int', nullable: true })
  minStudents?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ nullable: true })
  currency?: string;

  @Column({ type: 'jsonb' })
  schedule: ScheduleInfo[];

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'uuid' })
  @Index()
  courseId: string;

  @ManyToOne(() => Course, course => course.instances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'uuid', nullable: true })
  instructorId?: string;

  @ManyToOne(() => Person, { nullable: true })
  @JoinColumn({ name: 'instructorId' })
  instructor?: Person;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @OneToMany('Enrollment', 'courseInstance')
  enrollments: any[];

  @OneToMany('AttendanceRecord', 'courseInstance')
  attendanceRecords: any[];

  @OneToMany('Schedule', 'courseInstance')
  schedules: any[];

  get enrolledStudents(): number {
    return this.enrollments?.filter((e: any) => e.status === 'enrolled').length || 0;
  }

  get availableSlots(): number {
    const max = this.maxStudents || this.course?.maxStudents || 20;
    return Math.max(0, max - this.enrolledStudents);
  }
}