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
  GradeService,
  CreateGradeDto,
  UpdateGradeDto,
  GradeFilters,
} from '../services/grade.service';
import { Grade } from '../entities/grade.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/v1/academic/grades')
@UseGuards(JwtAuthGuard)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  create(@Body() createDto: CreateGradeDto): Promise<Grade> {
    return this.gradeService.create(createDto);
  }

  @Post('bulk')
  bulkCreate(@Body() grades: CreateGradeDto[]): Promise<Grade[]> {
    return this.gradeService.bulkCreateGrades(grades);
  }

  @Get()
  findAll(@Query() filters: GradeFilters): Promise<Grade[]> {
    return this.gradeService.findAll(filters);
  }

  @Get('enrollment/:enrollmentId')
  getEnrollmentGrades(@Param('enrollmentId') enrollmentId: string): Promise<Grade[]> {
    return this.gradeService.getEnrollmentGrades(enrollmentId);
  }

  @Get('enrollment/:enrollmentId/stats')
  getGradeStats(@Param('enrollmentId') enrollmentId: string): Promise<any> {
    return this.gradeService.getGradeStats(enrollmentId);
  }

  @Get('enrollment/:enrollmentId/final')
  getFinalGrade(@Param('enrollmentId') enrollmentId: string): Promise<Grade | null> {
    return this.gradeService.getFinalGrade(enrollmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Grade> {
    return this.gradeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateGradeDto,
  ): Promise<Grade> {
    return this.gradeService.update(id, updateDto);
  }

  @Patch(':id/drop')
  drop(@Param('id') id: string): Promise<Grade> {
    return this.gradeService.drop(id);
  }

  @Patch(':id/undrop')
  undrop(@Param('id') id: string): Promise<Grade> {
    return this.gradeService.undrop(id);
  }

  @Post('enrollment/:enrollmentId/final')
  createFinalGrade(
    @Param('enrollmentId') enrollmentId: string,
    @Body() data: { score: number; maxScore?: number },
  ): Promise<Grade> {
    return this.gradeService.createFinalGrade(enrollmentId, data.score, data.maxScore);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.gradeService.remove(id);
  }
}