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
  EnrollmentService,
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
  EnrollmentFilters,
} from '../services/enrollment.service';
import { Enrollment } from '../entities/enrollment.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/v1/academic/enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  enroll(@Body() createDto: CreateEnrollmentDto): Promise<Enrollment> {
    return this.enrollmentService.enroll(createDto);
  }

  @Get()
  findAll(@Query() filters: EnrollmentFilters): Promise<Enrollment[]> {
    return this.enrollmentService.findAll(filters);
  }

  @Get('student/:studentId')
  getStudentEnrollments(@Param('studentId') studentId: string): Promise<Enrollment[]> {
    return this.enrollmentService.getStudentEnrollments(studentId);
  }

  @Get('course-instance/:courseInstanceId')
  getCourseEnrollments(@Param('courseInstanceId') courseInstanceId: string): Promise<Enrollment[]> {
    return this.enrollmentService.getCourseEnrollments(courseInstanceId);
  }

  @Get('course-instance/:courseInstanceId/waitlist')
  getWaitlist(@Param('courseInstanceId') courseInstanceId: string): Promise<Enrollment[]> {
    return this.enrollmentService.getWaitlist(courseInstanceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Enrollment> {
    return this.enrollmentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEnrollmentDto,
  ): Promise<Enrollment> {
    return this.enrollmentService.update(id, updateDto);
  }

  @Patch(':id/drop')
  drop(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<Enrollment> {
    return this.enrollmentService.drop(id, reason);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string): Promise<Enrollment> {
    return this.enrollmentService.complete(id);
  }

  @Patch(':id/fail')
  fail(@Param('id') id: string): Promise<Enrollment> {
    return this.enrollmentService.fail(id);
  }

  @Patch(':id/payment')
  updatePayment(
    @Param('id') id: string,
    @Body() paymentData: any,
  ): Promise<Enrollment> {
    return this.enrollmentService.updatePayment(id, paymentData);
  }

  @Post('course-instance/:courseInstanceId/process-waitlist')
  processWaitlist(@Param('courseInstanceId') courseInstanceId: string): Promise<void> {
    return this.enrollmentService.processWaitlist(courseInstanceId);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    // Note: This would be a hard delete, consider if this should be allowed
    // For now, redirecting to drop
    return this.enrollmentService.drop(id, 'Enrollment removed').then((): void => undefined);
  }
}