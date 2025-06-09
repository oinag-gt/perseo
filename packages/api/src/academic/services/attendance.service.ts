import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { AttendanceRecord, AttendanceStatus } from '../entities/attendance-record.entity';
import { EnrollmentService } from './enrollment.service';
import { ScheduleService } from './schedule.service';
import { TenantService } from '../../database/tenant.service';

export interface CreateAttendanceDto {
  enrollmentId: string;
  courseInstanceId: string;
  scheduleId?: string;
  date: Date;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  minutesLate?: number;
  minutesPresent?: number;
  notes?: string;
  excuseReason?: string;
  recordedById?: string;
}

export interface UpdateAttendanceDto extends Partial<CreateAttendanceDto> {}

export interface AttendanceFilters {
  enrollmentId?: string;
  courseInstanceId?: string;
  scheduleId?: string;
  status?: AttendanceStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface BulkAttendanceDto {
  courseInstanceId: string;
  scheduleId?: string;
  date: Date;
  records: {
    enrollmentId: string;
    status: AttendanceStatus;
    checkInTime?: Date;
    checkOutTime?: Date;
    minutesLate?: number;
    notes?: string;
    excuseReason?: string;
  }[];
  recordedById?: string;
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private attendanceRepository: Repository<AttendanceRecord>,
    private enrollmentService: EnrollmentService,
    private scheduleService: ScheduleService,
    private tenantService: TenantService,
  ) {}

  async create(createDto: CreateAttendanceDto): Promise<AttendanceRecord> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    // Validate enrollment exists
    await this.enrollmentService.findOne(createDto.enrollmentId);

    // Validate schedule if provided
    if (createDto.scheduleId) {
      await this.scheduleService.findOne(createDto.scheduleId);
    }

    // Check if attendance already exists for this date
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        enrollmentId: createDto.enrollmentId,
        date: createDto.date,
        tenantId,
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('Attendance already recorded for this date');
    }

    const attendance = this.attendanceRepository.create({
      ...createDto,
      recordedAt: new Date(),
      tenantId,
    });

    return this.attendanceRepository.save(attendance);
  }

  async bulkCreate(bulkDto: BulkAttendanceDto): Promise<AttendanceRecord[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const records: AttendanceRecord[] = [];

    for (const record of bulkDto.records) {
      // Check if attendance already exists
      const existingAttendance = await this.attendanceRepository.findOne({
        where: {
          enrollmentId: record.enrollmentId,
          date: bulkDto.date,
          tenantId,
        },
      });

      if (!existingAttendance) {
        const attendance = this.attendanceRepository.create({
          ...record,
          courseInstanceId: bulkDto.courseInstanceId,
          scheduleId: bulkDto.scheduleId,
          date: bulkDto.date,
          recordedById: bulkDto.recordedById,
          recordedAt: new Date(),
          tenantId,
        });

        records.push(attendance);
      }
    }

    return this.attendanceRepository.save(records);
  }

  async findAll(filters: AttendanceFilters = {}): Promise<AttendanceRecord[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const where: FindOptionsWhere<AttendanceRecord> = { tenantId };

    if (filters.enrollmentId) {
      where.enrollmentId = filters.enrollmentId;
    }
    
    if (filters.courseInstanceId) {
      where.courseInstanceId = filters.courseInstanceId;
    }
    
    if (filters.scheduleId) {
      where.scheduleId = filters.scheduleId;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate && filters.endDate) {
      where.date = Between(filters.startDate, filters.endDate);
    }

    return this.attendanceRepository.find({
      where,
      relations: ['enrollment', 'enrollment.student', 'courseInstance', 'schedule'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AttendanceRecord> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const attendance = await this.attendanceRepository.findOne({
      where: { id, tenantId },
      relations: ['enrollment', 'enrollment.student', 'courseInstance', 'schedule'],
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return attendance;
  }

  async update(id: string, updateDto: UpdateAttendanceDto): Promise<AttendanceRecord> {
    const attendance = await this.findOne(id);
    Object.assign(attendance, updateDto);
    return this.attendanceRepository.save(attendance);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.attendanceRepository.softDelete(id);
  }

  async getStudentAttendance(enrollmentId: string): Promise<AttendanceRecord[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    return this.attendanceRepository.find({
      where: { enrollmentId, tenantId },
      relations: ['schedule'],
      order: { date: 'ASC' },
    });
  }

  async getCourseAttendance(courseInstanceId: string, date?: Date): Promise<AttendanceRecord[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const where: FindOptionsWhere<AttendanceRecord> = { courseInstanceId, tenantId };

    if (date) {
      where.date = date;
    }

    return this.attendanceRepository.find({
      where,
      relations: ['enrollment', 'enrollment.student'],
      order: { date: 'DESC', enrollmentId: 'ASC' },
    });
  }

  async getAttendanceStats(enrollmentId: string): Promise<{
    totalSessions: number;
    presentSessions: number;
    absentSessions: number;
    excusedSessions: number;
    lateSessions: number;
    attendancePercentage: number;
  }> {
    const records = await this.getStudentAttendance(enrollmentId);
    
    const stats = {
      totalSessions: records.length,
      presentSessions: records.filter(r => r.status === AttendanceStatus.PRESENT).length,
      absentSessions: records.filter(r => r.status === AttendanceStatus.ABSENT).length,
      excusedSessions: records.filter(r => r.status === AttendanceStatus.EXCUSED).length,
      lateSessions: records.filter(r => r.status === AttendanceStatus.LATE).length,
      attendancePercentage: 0,
    };

    if (stats.totalSessions > 0) {
      stats.attendancePercentage = 
        ((stats.presentSessions + stats.lateSessions) / stats.totalSessions) * 100;
    }

    return stats;
  }

  async markPresent(enrollmentId: string, date: Date, checkInTime?: Date): Promise<AttendanceRecord> {
    return this.create({
      enrollmentId,
      courseInstanceId: '', // Will be populated from enrollment
      date,
      status: AttendanceStatus.PRESENT,
      checkInTime: checkInTime || new Date(),
    });
  }

  async markAbsent(enrollmentId: string, date: Date): Promise<AttendanceRecord> {
    return this.create({
      enrollmentId,
      courseInstanceId: '', // Will be populated from enrollment
      date,
      status: AttendanceStatus.ABSENT,
    });
  }

  async markLate(
    enrollmentId: string, 
    date: Date, 
    checkInTime: Date, 
    minutesLate: number
  ): Promise<AttendanceRecord> {
    return this.create({
      enrollmentId,
      courseInstanceId: '', // Will be populated from enrollment
      date,
      status: AttendanceStatus.LATE,
      checkInTime,
      minutesLate,
    });
  }

  async markExcused(
    enrollmentId: string, 
    date: Date, 
    excuseReason: string
  ): Promise<AttendanceRecord> {
    return this.create({
      enrollmentId,
      courseInstanceId: '', // Will be populated from enrollment
      date,
      status: AttendanceStatus.EXCUSED,
      excuseReason,
    });
  }
}