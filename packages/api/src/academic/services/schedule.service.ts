import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { Schedule, ScheduleType, ScheduleStatus } from '../entities/schedule.entity';
import { CourseInstanceService } from './course-instance.service';
import { TenantService } from '../../database/tenant.service';

export interface CreateScheduleDto {
  title: string;
  description?: string;
  type: ScheduleType;
  startDateTime: Date;
  endDateTime: Date;
  location?: string;
  room?: string;
  agenda?: string;
  materials?: string;
  homework?: string;
  notes?: string;
  courseInstanceId: string;
}

export interface UpdateScheduleDto extends Partial<CreateScheduleDto> {
  status?: ScheduleStatus;
  cancellationReason?: string;
}

export interface ScheduleFilters {
  courseInstanceId?: string;
  type?: ScheduleType;
  status?: ScheduleStatus;
  startDate?: Date;
  endDate?: Date;
  location?: string;
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    private courseInstanceService: CourseInstanceService,
    private tenantService: TenantService,
  ) {}

  async create(createDto: CreateScheduleDto): Promise<Schedule> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    // Validate course instance exists
    await this.courseInstanceService.findOne(createDto.courseInstanceId);

    // Validate dates
    if (createDto.startDateTime >= createDto.endDateTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    const schedule = this.scheduleRepository.create({
      ...createDto,
      tenantId,
    });

    return this.scheduleRepository.save(schedule);
  }

  async findAll(filters: ScheduleFilters = {}): Promise<Schedule[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const where: FindOptionsWhere<Schedule> = { tenantId };

    if (filters.courseInstanceId) {
      where.courseInstanceId = filters.courseInstanceId;
    }
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.location) {
      where.location = filters.location;
    }

    if (filters.startDate && filters.endDate) {
      where.startDateTime = Between(filters.startDate, filters.endDate);
    }

    return this.scheduleRepository.find({
      where,
      relations: ['courseInstance', 'courseInstance.course'],
      order: { startDateTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Schedule> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const schedule = await this.scheduleRepository.findOne({
      where: { id, tenantId },
      relations: ['courseInstance', 'courseInstance.course'],
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async update(id: string, updateDto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.findOne(id);

    // Validate dates if they're being updated
    const startDateTime = updateDto.startDateTime || schedule.startDateTime;
    const endDateTime = updateDto.endDateTime || schedule.endDateTime;

    if (startDateTime >= endDateTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    Object.assign(schedule, updateDto);
    return this.scheduleRepository.save(schedule);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.scheduleRepository.softDelete(id);
  }

  async cancel(id: string, reason: string): Promise<Schedule> {
    return this.update(id, {
      status: ScheduleStatus.CANCELLED,
      cancellationReason: reason,
    });
  }

  async confirm(id: string): Promise<Schedule> {
    return this.update(id, { status: ScheduleStatus.CONFIRMED });
  }

  async complete(id: string): Promise<Schedule> {
    return this.update(id, { status: ScheduleStatus.COMPLETED });
  }

  async reschedule(id: string, newStartDateTime: Date, newEndDateTime: Date): Promise<Schedule> {
    const originalSchedule = await this.findOne(id);

    // Mark original as rescheduled
    await this.update(id, { status: ScheduleStatus.RESCHEDULED });

    // Create new schedule
    const newSchedule = await this.create({
      title: originalSchedule.title,
      description: originalSchedule.description,
      type: originalSchedule.type,
      startDateTime: newStartDateTime,
      endDateTime: newEndDateTime,
      location: originalSchedule.location,
      room: originalSchedule.room,
      agenda: originalSchedule.agenda,
      materials: originalSchedule.materials,
      homework: originalSchedule.homework,
      notes: originalSchedule.notes,
      courseInstanceId: originalSchedule.courseInstanceId,
    });

    // Link to original
    newSchedule.originalScheduleId = originalSchedule.id;
    return this.scheduleRepository.save(newSchedule);
  }

  async getTodaysSchedule(): Promise<Schedule[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return this.scheduleRepository.find({
      where: {
        tenantId,
        startDateTime: Between(startOfDay, endOfDay),
        status: ScheduleStatus.CONFIRMED,
      },
      relations: ['courseInstance', 'courseInstance.course'],
      order: { startDateTime: 'ASC' },
    });
  }

  async getUpcomingSchedule(days: number = 7): Promise<Schedule[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const now = new Date();
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    return this.scheduleRepository.find({
      where: {
        tenantId,
        startDateTime: Between(now, futureDate),
        status: ScheduleStatus.CONFIRMED,
      },
      relations: ['courseInstance', 'courseInstance.course'],
      order: { startDateTime: 'ASC' },
    });
  }

  async getScheduleConflicts(
    startDateTime: Date,
    endDateTime: Date,
    excludeId?: string,
  ): Promise<Schedule[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const query = this.scheduleRepository.createQueryBuilder('schedule')
      .where('schedule.tenantId = :tenantId', { tenantId })
      .andWhere('schedule.status != :cancelledStatus', { cancelledStatus: ScheduleStatus.CANCELLED })
      .andWhere(
        '(schedule.startDateTime < :endDateTime AND schedule.endDateTime > :startDateTime)',
        { startDateTime, endDateTime }
      );

    if (excludeId) {
      query.andWhere('schedule.id != :excludeId', { excludeId });
    }

    return query.getMany();
  }
}