import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Course, CourseStatus } from '../entities/course.entity';
import { TenantService } from '../../database/tenant.service';

export interface CreateCourseDto {
  name: string;
  code: string;
  description: string;
  shortDescription?: string;
  level: string;
  category: string;
  tags?: string[];
  durationHours: number;
  maxStudents?: number;
  minStudents?: number;
  price?: number;
  currency?: string;
  requirements?: any;
  materials?: any;
  imageUrl?: string;
  notes?: string;
  instructorId?: string;
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {
  status?: CourseStatus;
}

export interface CourseFilters {
  search?: string;
  category?: string;
  level?: string;
  status?: CourseStatus;
  instructorId?: string;
  tags?: string[];
}

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private tenantService: TenantService,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    // Check if course code already exists for this tenant
    const existingCourse = await this.courseRepository.findOne({
      where: { code: createCourseDto.code, tenantId },
    });

    if (existingCourse) {
      throw new ConflictException('Course with this code already exists');
    }

    const course = this.courseRepository.create({
      ...createCourseDto,
      level: createCourseDto.level as any,
      tenantId,
    });

    return this.courseRepository.save(course);
  }

  async findAll(filters: CourseFilters = {}): Promise<Course[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const where: FindOptionsWhere<Course> = { tenantId };

    if (filters.search) {
      where.name = ILike(`%${filters.search}%`);
    }
    
    if (filters.category) {
      where.category = filters.category;
    }
    
    if (filters.level) {
      where.level = filters.level as any;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.instructorId) {
      where.instructorId = filters.instructorId;
    }

    return this.courseRepository.find({
      where,
      relations: ['instructor', 'instances'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Course> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const course = await this.courseRepository.findOne({
      where: { id, tenantId },
      relations: ['instructor', 'instances'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async findByCode(code: string): Promise<Course> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const course = await this.courseRepository.findOne({
      where: { code, tenantId },
      relations: ['instructor', 'instances'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const course = await this.findOne(id);

    // Check if course code is being changed and already exists
    if (updateCourseDto.code && updateCourseDto.code !== course.code) {
      const existingCourse = await this.courseRepository.findOne({
        where: { code: updateCourseDto.code, tenantId },
      });

      if (existingCourse) {
        throw new ConflictException('Course with this code already exists');
      }
    }

    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.courseRepository.softDelete(id);
  }

  async activate(id: string): Promise<Course> {
    return this.update(id, { status: CourseStatus.ACTIVE });
  }

  async archive(id: string): Promise<Course> {
    return this.update(id, { status: CourseStatus.ARCHIVED });
  }

  async getCategories(): Promise<string[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const courses = await this.courseRepository.find({
      where: { tenantId },
      select: ['category'],
    });

    const categories = [...new Set(courses.map(course => course.category))];
    return categories.filter(Boolean);
  }

  async getTags(): Promise<string[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const courses = await this.courseRepository.find({
      where: { tenantId },
      select: ['tags'],
    });

    const allTags = courses.flatMap(course => course.tags || []);
    return [...new Set(allTags)];
  }
}