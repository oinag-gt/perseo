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
  CourseInstanceService,
  CreateCourseInstanceDto,
  UpdateCourseInstanceDto,
  CourseInstanceFilters,
} from '../services/course-instance.service';
import { CourseInstance } from '../entities/course-instance.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/v1/academic/course-instances')
@UseGuards(JwtAuthGuard)
export class CourseInstanceController {
  constructor(private readonly courseInstanceService: CourseInstanceService) {}

  @Post()
  create(@Body() createDto: CreateCourseInstanceDto): Promise<CourseInstance> {
    return this.courseInstanceService.create(createDto);
  }

  @Get()
  findAll(@Query() filters: CourseInstanceFilters): Promise<CourseInstance[]> {
    return this.courseInstanceService.findAll(filters);
  }

  @Get('upcoming')
  getUpcoming(@Query('limit') limit?: number): Promise<CourseInstance[]> {
    return this.courseInstanceService.getUpcoming(limit);
  }

  @Get('enrollment-open')
  getEnrollmentOpen(): Promise<CourseInstance[]> {
    return this.courseInstanceService.getEnrollmentOpen();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CourseInstance> {
    return this.courseInstanceService.findOne(id);
  }

  @Get('by-code/:code')
  findByCode(@Param('code') code: string): Promise<CourseInstance> {
    return this.courseInstanceService.findByCode(code);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCourseInstanceDto,
  ): Promise<CourseInstance> {
    return this.courseInstanceService.update(id, updateDto);
  }

  @Patch(':id/open-enrollment')
  openEnrollment(@Param('id') id: string): Promise<CourseInstance> {
    return this.courseInstanceService.openEnrollment(id);
  }

  @Patch(':id/close-enrollment')
  closeEnrollment(@Param('id') id: string): Promise<CourseInstance> {
    return this.courseInstanceService.closeEnrollment(id);
  }

  @Patch(':id/start')
  startCourse(@Param('id') id: string): Promise<CourseInstance> {
    return this.courseInstanceService.startCourse(id);
  }

  @Patch(':id/complete')
  completeCourse(@Param('id') id: string): Promise<CourseInstance> {
    return this.courseInstanceService.completeCourse(id);
  }

  @Patch(':id/cancel')
  cancelCourse(@Param('id') id: string): Promise<CourseInstance> {
    return this.courseInstanceService.cancelCourse(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.courseInstanceService.remove(id);
  }
}