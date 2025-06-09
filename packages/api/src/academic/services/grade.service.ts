import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Grade, GradeType, GradeScale } from '../entities/grade.entity';
import { EnrollmentService } from './enrollment.service';
import { TenantService } from '../../database/tenant.service';

export interface CreateGradeDto {
  enrollmentId: string;
  name: string;
  description?: string;
  type: GradeType;
  scale?: GradeScale;
  score: number;
  maxScore: number;
  weight?: number;
  letterGrade?: string;
  dueDate?: Date;
  submissionDate?: Date;
  feedback?: string;
  notes?: string;
  isExtraCredit?: boolean;
  gradedById?: string;
}

export interface UpdateGradeDto extends Partial<CreateGradeDto> {
  isDropped?: boolean;
}

export interface GradeFilters {
  enrollmentId?: string;
  type?: GradeType;
  scale?: GradeScale;
  isDropped?: boolean;
  isExtraCredit?: boolean;
}

export interface GradeStats {
  totalGrades: number;
  averageScore: number;
  weightedAverage: number;
  letterGrade: string;
  isPassing: boolean;
  breakdown: {
    [key in GradeType]?: {
      count: number;
      average: number;
      weight: number;
    };
  };
}

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
    private enrollmentService: EnrollmentService,
    private tenantService: TenantService,
  ) {}

  async create(createDto: CreateGradeDto): Promise<Grade> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    // Validate enrollment exists
    await this.enrollmentService.findOne(createDto.enrollmentId);

    // Validate score
    if (createDto.score < 0 || createDto.score > createDto.maxScore) {
      throw new BadRequestException('Score must be between 0 and max score');
    }

    // Calculate isPassing based on percentage
    const percentage = (createDto.score / createDto.maxScore) * 100;
    const isPassing = percentage >= 60; // 60% passing grade

    const grade = this.gradeRepository.create({
      ...createDto,
      isPassing,
      gradedAt: new Date(),
      tenantId,
    });

    return this.gradeRepository.save(grade);
  }

  async findAll(filters: GradeFilters = {}): Promise<Grade[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const where: FindOptionsWhere<Grade> = { tenantId };

    if (filters.enrollmentId) {
      where.enrollmentId = filters.enrollmentId;
    }
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.scale) {
      where.scale = filters.scale;
    }
    
    if (filters.isDropped !== undefined) {
      where.isDropped = filters.isDropped;
    }
    
    if (filters.isExtraCredit !== undefined) {
      where.isExtraCredit = filters.isExtraCredit;
    }

    return this.gradeRepository.find({
      where,
      relations: ['enrollment', 'enrollment.student', 'gradedBy'],
      order: { gradedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Grade> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const grade = await this.gradeRepository.findOne({
      where: { id, tenantId },
      relations: ['enrollment', 'enrollment.student', 'gradedBy'],
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    return grade;
  }

  async update(id: string, updateDto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.findOne(id);

    // Validate score if being updated
    if (updateDto.score !== undefined && updateDto.maxScore !== undefined) {
      if (updateDto.score < 0 || updateDto.score > updateDto.maxScore) {
        throw new BadRequestException('Score must be between 0 and max score');
      }
    } else if (updateDto.score !== undefined) {
      if (updateDto.score < 0 || updateDto.score > grade.maxScore) {
        throw new BadRequestException('Score must be between 0 and max score');
      }
    }

    // Recalculate isPassing if score or maxScore changed
    if (updateDto.score !== undefined || updateDto.maxScore !== undefined) {
      const score = updateDto.score ?? grade.score;
      const maxScore = updateDto.maxScore ?? grade.maxScore;
      const percentage = (score / maxScore) * 100;
      (updateDto as any).isPassing = percentage >= 60;
    }

    Object.assign(grade, updateDto);
    return this.gradeRepository.save(grade);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.gradeRepository.softDelete(id);
  }

  async drop(id: string): Promise<Grade> {
    return this.update(id, { isDropped: true });
  }

  async undrop(id: string): Promise<Grade> {
    return this.update(id, { isDropped: false });
  }

  async getEnrollmentGrades(enrollmentId: string): Promise<Grade[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    return this.gradeRepository.find({
      where: { enrollmentId, tenantId, isDropped: false },
      order: { gradedAt: 'ASC' },
    });
  }

  async getGradeStats(enrollmentId: string): Promise<GradeStats> {
    const grades = await this.getEnrollmentGrades(enrollmentId);
    
    if (grades.length === 0) {
      return {
        totalGrades: 0,
        averageScore: 0,
        weightedAverage: 0,
        letterGrade: 'N/A',
        isPassing: false,
        breakdown: {},
      };
    }

    // Calculate average score
    const totalScore = grades.reduce((sum, grade) => sum + grade.percentage, 0);
    const averageScore = totalScore / grades.length;

    // Calculate weighted average
    const totalWeight = grades.reduce((sum, grade) => sum + (grade.weight || 0), 0);
    let weightedAverage = averageScore;

    if (totalWeight > 0) {
      const weightedSum = grades.reduce((sum, grade) => {
        return sum + (grade.weightedScore || grade.percentage);
      }, 0);
      weightedAverage = weightedSum;
    }

    // Calculate breakdown by type
    const breakdown: GradeStats['breakdown'] = {};
    for (const type of Object.values(GradeType)) {
      const typeGrades = grades.filter(g => g.type === type);
      if (typeGrades.length > 0) {
        const typeAverage = typeGrades.reduce((sum, g) => sum + g.percentage, 0) / typeGrades.length;
        const typeWeight = typeGrades.reduce((sum, g) => sum + (g.weight || 0), 0);
        
        breakdown[type] = {
          count: typeGrades.length,
          average: typeAverage,
          weight: typeWeight,
        };
      }
    }

    return {
      totalGrades: grades.length,
      averageScore,
      weightedAverage,
      letterGrade: this.calculateLetterGrade(weightedAverage),
      isPassing: weightedAverage >= 60,
      breakdown,
    };
  }

  async getFinalGrade(enrollmentId: string): Promise<Grade | null> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    return this.gradeRepository.findOne({
      where: {
        enrollmentId,
        type: GradeType.FINAL,
        tenantId,
        isDropped: false,
      },
    });
  }

  async createFinalGrade(enrollmentId: string, score: number, maxScore: number = 100): Promise<Grade> {
    const existingFinal = await this.getFinalGrade(enrollmentId);
    
    if (existingFinal) {
      throw new BadRequestException('Final grade already exists for this enrollment');
    }

    return this.create({
      enrollmentId,
      name: 'Final Grade',
      type: GradeType.FINAL,
      score,
      maxScore,
      weight: 100,
    });
  }

  private calculateLetterGrade(percentage: number): string {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 65) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  }

  async bulkCreateGrades(grades: CreateGradeDto[]): Promise<Grade[]> {
    const createdGrades: Grade[] = [];
    
    for (const gradeDto of grades) {
      const grade = await this.create(gradeDto);
      createdGrades.push(grade);
    }
    
    return createdGrades;
  }
}