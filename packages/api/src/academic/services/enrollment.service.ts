import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Enrollment, EnrollmentStatus, PaymentStatus } from '../entities/enrollment.entity';
import { CourseInstanceService } from './course-instance.service';
import { CourseInstanceStatus } from '../entities/course-instance.entity';
import { TenantService } from '../../database/tenant.service';

export interface CreateEnrollmentDto {
  studentId: string;
  courseInstanceId: string;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  amountDue?: number;
  discountAmount?: number;
  metadata?: any;
  notes?: string;
}

export interface UpdateEnrollmentDto extends Partial<CreateEnrollmentDto> {
  status?: EnrollmentStatus;
  completionDate?: Date;
  dropDate?: Date;
  dropReason?: string;
}

export interface EnrollmentFilters {
  studentId?: string;
  courseInstanceId?: string;
  status?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    private courseInstanceService: CourseInstanceService,
    private tenantService: TenantService,
  ) {}

  async enroll(createDto: CreateEnrollmentDto): Promise<Enrollment> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    // Validate course instance exists and enrollment is open
    const courseInstance = await this.courseInstanceService.findOne(createDto.courseInstanceId);
    
    if (courseInstance.status !== CourseInstanceStatus.ENROLLMENT_OPEN) {
      throw new BadRequestException('Enrollment is not open for this course instance');
    }

    // Check if student is already enrolled
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        studentId: createDto.studentId,
        courseInstanceId: createDto.courseInstanceId,
        tenantId,
      },
    });

    if (existingEnrollment && existingEnrollment.status !== EnrollmentStatus.DROPPED) {
      throw new ConflictException('Student is already enrolled in this course instance');
    }

    // Check if course is full
    const currentEnrollments = await this.countActiveEnrollments(createDto.courseInstanceId);
    const maxStudents = courseInstance.maxStudents || courseInstance.course?.maxStudents || 20;

    let status = EnrollmentStatus.ENROLLED;
    if (currentEnrollments >= maxStudents) {
      status = EnrollmentStatus.WAITLISTED;
    }

    const enrollment = this.enrollmentRepository.create({
      ...createDto,
      status,
      enrollmentDate: new Date(),
      tenantId,
    });

    return this.enrollmentRepository.save(enrollment);
  }

  async findAll(filters: EnrollmentFilters = {}): Promise<Enrollment[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const where: FindOptionsWhere<Enrollment> = { tenantId };

    if (filters.studentId) {
      where.studentId = filters.studentId;
    }
    
    if (filters.courseInstanceId) {
      where.courseInstanceId = filters.courseInstanceId;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    return this.enrollmentRepository.find({
      where,
      relations: ['student', 'courseInstance', 'courseInstance.course', 'grades'],
      order: { enrollmentDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Enrollment> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id, tenantId },
      relations: ['student', 'courseInstance', 'courseInstance.course', 'grades', 'attendanceRecords'],
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  async update(id: string, updateDto: UpdateEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    // Handle status changes
    if (updateDto.status && updateDto.status !== enrollment.status) {
      await this.handleStatusChange(enrollment, updateDto.status, updateDto);
    }

    Object.assign(enrollment, updateDto);
    return this.enrollmentRepository.save(enrollment);
  }

  async drop(id: string, reason?: string): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    if (enrollment.status === EnrollmentStatus.DROPPED) {
      throw new BadRequestException('Student is already dropped from this course');
    }

    const updateData: UpdateEnrollmentDto = {
      status: EnrollmentStatus.DROPPED,
      dropDate: new Date(),
      dropReason: reason,
    };

    const updatedEnrollment = await this.update(id, updateData);

    // Process waitlist if someone dropped
    await this.processWaitlist(updatedEnrollment.courseInstanceId);

    return updatedEnrollment;
  }

  async complete(id: string): Promise<Enrollment> {
    return this.update(id, {
      status: EnrollmentStatus.COMPLETED,
      completionDate: new Date(),
    });
  }

  async fail(id: string): Promise<Enrollment> {
    return this.update(id, {
      status: EnrollmentStatus.FAILED,
      completionDate: new Date(),
    });
  }

  async updatePayment(id: string, paymentData: {
    paymentStatus: PaymentStatus;
    amountPaid?: number;
    amountDue?: number;
  }): Promise<Enrollment> {
    return this.update(id, paymentData);
  }

  async getWaitlist(courseInstanceId: string): Promise<Enrollment[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    return this.enrollmentRepository.find({
      where: {
        courseInstanceId,
        status: EnrollmentStatus.WAITLISTED,
        tenantId,
      },
      relations: ['student'],
      order: { enrollmentDate: 'ASC' },
    });
  }

  async processWaitlist(courseInstanceId: string): Promise<void> {
    const courseInstance = await this.courseInstanceService.findOne(courseInstanceId);
    const maxStudents = courseInstance.maxStudents || courseInstance.course?.maxStudents || 20;
    const currentEnrollments = await this.countActiveEnrollments(courseInstanceId);
    const availableSlots = maxStudents - currentEnrollments;

    if (availableSlots > 0) {
      const waitlist = await this.getWaitlist(courseInstanceId);
      const toEnroll = waitlist.slice(0, availableSlots);

      for (const enrollment of toEnroll) {
        await this.update(enrollment.id, { status: EnrollmentStatus.ENROLLED });
      }
    }
  }

  private async countActiveEnrollments(courseInstanceId: string): Promise<number> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    return this.enrollmentRepository.count({
      where: {
        courseInstanceId,
        status: EnrollmentStatus.ENROLLED,
        tenantId,
      },
    });
  }

  private async handleStatusChange(
    _enrollment: Enrollment,
    newStatus: EnrollmentStatus,
    updateDto: UpdateEnrollmentDto,
  ): Promise<void> {
    switch (newStatus) {
      case EnrollmentStatus.COMPLETED:
        updateDto.completionDate = new Date();
        break;
      case EnrollmentStatus.FAILED:
        updateDto.completionDate = new Date();
        break;
      case EnrollmentStatus.DROPPED:
        updateDto.dropDate = new Date();
        break;
    }
  }

  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    return this.enrollmentRepository.find({
      where: { studentId, tenantId },
      relations: ['courseInstance', 'courseInstance.course'],
      order: { enrollmentDate: 'DESC' },
    });
  }

  async getCourseEnrollments(courseInstanceId: string): Promise<Enrollment[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    return this.enrollmentRepository.find({
      where: { courseInstanceId, tenantId },
      relations: ['student'],
      order: { enrollmentDate: 'ASC' },
    });
  }
}