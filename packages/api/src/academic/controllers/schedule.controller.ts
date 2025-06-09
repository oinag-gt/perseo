import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ScheduleService,
  CreateScheduleDto,
  UpdateScheduleDto,
  ScheduleFilters,
} from '../services/schedule.service';
import { Schedule } from '../entities/schedule.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/v1/academic/schedules')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() createDto: CreateScheduleDto): Promise<Schedule> {
    return this.scheduleService.create(createDto);
  }

  @Get()
  findAll(@Query() filters: ScheduleFilters): Promise<Schedule[]> {
    return this.scheduleService.findAll(filters);
  }

  @Get('today')
  getTodaysSchedule(): Promise<Schedule[]> {
    return this.scheduleService.getTodaysSchedule();
  }

  @Get('upcoming')
  getUpcomingSchedule(@Query('days') days?: number): Promise<Schedule[]> {
    return this.scheduleService.getUpcomingSchedule(days);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Schedule> {
    return this.scheduleService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    return this.scheduleService.update(id, updateDto);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<Schedule> {
    return this.scheduleService.cancel(id, reason);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string): Promise<Schedule> {
    return this.scheduleService.confirm(id);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string): Promise<Schedule> {
    return this.scheduleService.complete(id);
  }

  @Post(':id/reschedule')
  reschedule(
    @Param('id') id: string,
    @Body() rescheduleData: { newStartDateTime: Date; newEndDateTime: Date },
  ): Promise<Schedule> {
    return this.scheduleService.reschedule(
      id,
      rescheduleData.newStartDateTime,
      rescheduleData.newEndDateTime,
    );
  }

  @Get(':id/conflicts')
  getConflicts(
    @Param('id') id: string,
    @Query('startDateTime') startDateTime: string,
    @Query('endDateTime') endDateTime: string,
  ): Promise<Schedule[]> {
    return this.scheduleService.getScheduleConflicts(
      new Date(startDateTime),
      new Date(endDateTime),
      id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.scheduleService.remove(id);
  }
}