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
import { CourseService, CreateCourseDto, UpdateCourseDto, CourseFilters } from '../services/course.service';
import { Course } from '../entities/course.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/v1/academic/courses')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  findAll(@Query() filters: CourseFilters): Promise<Course[]> {
    return this.courseService.findAll(filters);
  }

  @Get('categories')
  getCategories(): Promise<string[]> {
    return this.courseService.getCategories();
  }

  @Get('tags')
  getTags(): Promise<string[]> {
    return this.courseService.getTags();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Course> {
    return this.courseService.findOne(id);
  }

  @Get('by-code/:code')
  findByCode(@Param('code') code: string): Promise<Course> {
    return this.courseService.findByCode(code);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return this.courseService.update(id, updateCourseDto);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string): Promise<Course> {
    return this.courseService.activate(id);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string): Promise<Course> {
    return this.courseService.archive(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.courseService.remove(id);
  }
}