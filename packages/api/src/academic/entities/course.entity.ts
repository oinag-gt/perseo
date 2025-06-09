import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { Person } from '../../people/entities/person.entity';

export enum CourseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface CourseRequirements {
  prerequisites: string[];
  minimumAge?: number;
  maximumAge?: number;
  requiredDocuments: string[];
}

export interface CourseMaterials {
  syllabus?: string;
  textbooks: string[];
  additionalResources: string[];
}

@Entity('courses')
export class Course extends BaseEntity {
  @Column()
  @Index()
  name: string;

  @Column({ unique: true })
  @Index()
  code: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  shortDescription?: string;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @Column({
    type: 'enum',
    enum: CourseLevel,
    default: CourseLevel.BEGINNER,
  })
  level: CourseLevel;

  @Column()
  category: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column({ type: 'int' })
  durationHours: number;

  @Column({ type: 'int', default: 20 })
  maxStudents: number;

  @Column({ type: 'int', default: 5 })
  minStudents: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ nullable: true })
  currency?: string;

  @Column({ type: 'jsonb', nullable: true })
  requirements?: CourseRequirements;

  @Column({ type: 'jsonb', nullable: true })
  materials?: CourseMaterials;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

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

  @OneToMany('CourseInstance', 'course')
  instances: any[];
}