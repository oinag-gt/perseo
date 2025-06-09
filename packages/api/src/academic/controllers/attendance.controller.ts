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
  AttendanceService,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  AttendanceFilters,
  BulkAttendanceDto,
} from '../services/attendance.service';
import { AttendanceRecord } from '../entities/attendance-record.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/v1/academic/attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(@Body() createDto: CreateAttendanceDto): Promise<AttendanceRecord> {
    return this.attendanceService.create(createDto);
  }

  @Post('bulk')
  bulkCreate(@Body() bulkDto: BulkAttendanceDto): Promise<AttendanceRecord[]> {
    return this.attendanceService.bulkCreate(bulkDto);
  }

  @Get()
  findAll(@Query() filters: AttendanceFilters): Promise<AttendanceRecord[]> {
    return this.attendanceService.findAll(filters);
  }

  @Get('enrollment/:enrollmentId')
  getStudentAttendance(@Param('enrollmentId') enrollmentId: string): Promise<AttendanceRecord[]> {
    return this.attendanceService.getStudentAttendance(enrollmentId);
  }

  @Get('enrollment/:enrollmentId/stats')
  getAttendanceStats(@Param('enrollmentId') enrollmentId: string): Promise<any> {
    return this.attendanceService.getAttendanceStats(enrollmentId);
  }

  @Get('course-instance/:courseInstanceId')
  getCourseAttendance(
    @Param('courseInstanceId') courseInstanceId: string,
    @Query('date') date?: string,
  ): Promise<AttendanceRecord[]> {
    return this.attendanceService.getCourseAttendance(
      courseInstanceId,
      date ? new Date(date) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AttendanceRecord> {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAttendanceDto,
  ): Promise<AttendanceRecord> {
    return this.attendanceService.update(id, updateDto);
  }

  @Post('mark-present')
  markPresent(
    @Body() data: { enrollmentId: string; date: Date; checkInTime?: Date },
  ): Promise<AttendanceRecord> {
    return this.attendanceService.markPresent(data.enrollmentId, data.date, data.checkInTime);
  }

  @Post('mark-absent')
  markAbsent(
    @Body() data: { enrollmentId: string; date: Date },
  ): Promise<AttendanceRecord> {
    return this.attendanceService.markAbsent(data.enrollmentId, data.date);
  }

  @Post('mark-late')
  markLate(
    @Body() data: { enrollmentId: string; date: Date; checkInTime: Date; minutesLate: number },
  ): Promise<AttendanceRecord> {
    return this.attendanceService.markLate(
      data.enrollmentId,
      data.date,
      data.checkInTime,
      data.minutesLate,
    );
  }

  @Post('mark-excused')
  markExcused(
    @Body() data: { enrollmentId: string; date: Date; excuseReason: string },
  ): Promise<AttendanceRecord> {
    return this.attendanceService.markExcused(data.enrollmentId, data.date, data.excuseReason);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.attendanceService.remove(id);
  }
}