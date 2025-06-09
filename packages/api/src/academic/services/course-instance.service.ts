import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { CourseInstance, CourseInstanceStatus } from '../entities/course-instance.entity';
import { CourseService } from './course.service';
import { TenantService } from '../../database/tenant.service';

export interface CreateCourseInstanceDto {
  name: string;
  code: string;
  courseId: string;
  startDate: Date;
  endDate: Date;
  enrollmentStartDate: Date;
  enrollmentEndDate: Date;
  maxStudents?: number;
  minStudents?: number;
  price?: number;
  currency?: string;
  schedule: any[];
  location?: string;
  notes?: string;
  instructorId?: string;
}

export interface UpdateCourseInstanceDto extends Partial<CreateCourseInstanceDto> {
  status?: CourseInstanceStatus;
}

export interface CourseInstanceFilters {
  search?: string;
  courseId?: string;
  status?: CourseInstanceStatus;
  instructorId?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class CourseInstanceService {
  constructor(
    @InjectRepository(CourseInstance)
    private courseInstanceRepository: Repository<CourseInstance>,
    private courseService: CourseService,
    private tenantService: TenantService,
  ) {}

  async create(createDto: CreateCourseInstanceDto): Promise<CourseInstance> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    // Validate course exists
    await this.courseService.findOne(createDto.courseId);

    // Validate dates
    if (createDto.startDate >= createDto.endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (createDto.enrollmentEndDate > createDto.startDate) {
      throw new BadRequestException('Enrollment must end before course starts');
    }

    // Check if instance code already exists for this tenant
    const existingInstance = await this.courseInstanceRepository.findOne({
      where: { code: createDto.code, tenantId },
    });

    if (existingInstance) {
      throw new BadRequestException('Course instance with this code already exists');
    }

    const instance = this.courseInstanceRepository.create({
      ...createDto,
      tenantId,
    });

    return this.courseInstanceRepository.save(instance);
  }

  async findAll(filters: CourseInstanceFilters = {}): Promise<CourseInstance[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const where: FindOptionsWhere<CourseInstance> = { tenantId };

    if (filters.courseId) {
      where.courseId = filters.courseId;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.instructorId) {
      where.instructorId = filters.instructorId;
    }

    if (filters.startDate && filters.endDate) {
      where.startDate = Between(filters.startDate, filters.endDate);
    }

    return this.courseInstanceRepository.find({
      where,
      relations: ['course', 'instructor', 'enrollments', 'schedules'],
      order: { startDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CourseInstance> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const instance = await this.courseInstanceRepository.findOne({
      where: { id, tenantId },
      relations: ['course', 'instructor', 'enrollments', 'enrollments.student', 'schedules'],
    });

    if (!instance) {
      throw new NotFoundException('Course instance not found');
    }

    return instance;
  }

  async findByCode(code: string): Promise<CourseInstance> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const instance = await this.courseInstanceRepository.findOne({
      where: { code, tenantId },
      relations: ['course', 'instructor', 'enrollments', 'schedules'],
    });

    if (!instance) {
      throw new NotFoundException('Course instance not found');
    }

    return instance;
  }

  async update(id: string, updateDto: UpdateCourseInstanceDto): Promise<CourseInstance> {
    const instance = await this.findOne(id);

    // Validate dates if they're being updated
    const startDate = updateDto.startDate || instance.startDate;
    const endDate = updateDto.endDate || instance.endDate;
    const enrollmentEndDate = updateDto.enrollmentEndDate || instance.enrollmentEndDate;

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (enrollmentEndDate > startDate) {
      throw new BadRequestException('Enrollment must end before course starts');
    }

    Object.assign(instance, updateDto);
    return this.courseInstanceRepository.save(instance);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.courseInstanceRepository.softDelete(id);
  }

  async openEnrollment(id: string): Promise<CourseInstance> {
    return this.update(id, { status: CourseInstanceStatus.ENROLLMENT_OPEN });
  }

  async closeEnrollment(id: string): Promise<CourseInstance> {
    return this.update(id, { status: CourseInstanceStatus.ENROLLMENT_CLOSED });
  }

  async startCourse(id: string): Promise<CourseInstance> {
    return this.update(id, { status: CourseInstanceStatus.IN_PROGRESS });
  }

  async completeCourse(id: string): Promise<CourseInstance> {
    return this.update(id, { status: CourseInstanceStatus.COMPLETED });
  }

  async cancelCourse(id: string): Promise<CourseInstance> {
    return this.update(id, { status: CourseInstanceStatus.CANCELLED });
  }

  async getUpcoming(limit: number = 10): Promise<CourseInstance[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const now = new Date();

    return this.courseInstanceRepository.find({
      where: {
        tenantId,
        startDate: Between(now, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)), // Next 90 days
      },
      relations: ['course', 'instructor'],
      order: { startDate: 'ASC' },
      take: limit,
    });
  }

  async getEnrollmentOpen(): Promise<CourseInstance[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const now = new Date();

    return this.courseInstanceRepository.find({
      where: {
        tenantId,
        status: CourseInstanceStatus.ENROLLMENT_OPEN,
        enrollmentEndDate: Between(now, new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      },
      relations: ['course', 'instructor'],
      order: { enrollmentEndDate: 'ASC' },
    });
  }
}