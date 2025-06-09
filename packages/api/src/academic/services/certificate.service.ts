import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { Certificate, CertificateType, CertificateStatus } from '../entities/certificate.entity';
import { EnrollmentService } from './enrollment.service';
import { GradeService } from './grade.service';
import { EnrollmentStatus } from '../entities/enrollment.entity';
import { TenantService } from '../../database/tenant.service';

export interface CreateCertificateDto {
  enrollmentId: string;
  title: string;
  description?: string;
  type?: CertificateType;
  issueDate?: Date;
  expirationDate?: Date;
  finalGrade?: number;
  gradeScale?: string;
  creditsEarned?: number;
  metadata?: any;
  notes?: string;
  issuedById?: string;
}

export interface UpdateCertificateDto extends Partial<CreateCertificateDto> {
  status?: CertificateStatus;
  pdfUrl?: string;
  digitalSignatureUrl?: string;
  issuedAt?: Date;
  revokedById?: string;
  revokedAt?: Date;
  revocationReason?: string;
}

export interface CertificateFilters {
  enrollmentId?: string;
  type?: CertificateType;
  status?: CertificateStatus;
  isExpired?: boolean;
  issueYear?: number;
}

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    private enrollmentService: EnrollmentService,
    private gradeService: GradeService,
    private tenantService: TenantService,
  ) {}

  async create(createDto: CreateCertificateDto): Promise<Certificate> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    // Validate enrollment exists and is completed
    const enrollment = await this.enrollmentService.findOne(createDto.enrollmentId);
    
    if (enrollment.status !== EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Certificate can only be created for completed enrollments');
    }

    // Check if certificate already exists
    const existingCertificate = await this.certificateRepository.findOne({
      where: {
        enrollmentId: createDto.enrollmentId,
        type: createDto.type || CertificateType.COMPLETION,
        tenantId,
      },
    });

    if (existingCertificate) {
      throw new BadRequestException('Certificate already exists for this enrollment and type');
    }

    // Get final grade if not provided
    let finalGrade = createDto.finalGrade;
    if (!finalGrade) {
      const gradeStats = await this.gradeService.getGradeStats(createDto.enrollmentId);
      finalGrade = gradeStats.weightedAverage;
    }

    // Generate certificate number
    const certificateNumber = await this.generateCertificateNumber();

    const certificate = this.certificateRepository.create({
      ...createDto,
      certificateNumber,
      finalGrade,
      gradeScale: createDto.gradeScale || 'percentage',
      issueDate: createDto.issueDate || new Date(),
      issuedAt: new Date(),
      tenantId,
    });

    return this.certificateRepository.save(certificate);
  }

  async findAll(filters: CertificateFilters = {}): Promise<Certificate[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const where: FindOptionsWhere<Certificate> = { tenantId };

    if (filters.enrollmentId) {
      where.enrollmentId = filters.enrollmentId;
    }
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }

    const certificates = await this.certificateRepository.find({
      where,
      relations: ['enrollment', 'enrollment.student', 'enrollment.courseInstance', 'enrollment.courseInstance.course'],
      order: { issueDate: 'DESC' },
    });

    // Filter by expiration if requested
    if (filters.isExpired !== undefined) {
      return certificates.filter(cert => cert.isExpired === filters.isExpired);
    }

    // Filter by issue year if requested
    if (filters.issueYear) {
      return certificates.filter(cert => cert.issueDate.getFullYear() === filters.issueYear);
    }

    return certificates;
  }

  async findOne(id: string): Promise<Certificate> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const certificate = await this.certificateRepository.findOne({
      where: { id, tenantId },
      relations: ['enrollment', 'enrollment.student', 'enrollment.courseInstance', 'enrollment.courseInstance.course', 'issuedBy'],
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async findByCertificateNumber(certificateNumber: string): Promise<Certificate> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    const certificate = await this.certificateRepository.findOne({
      where: { certificateNumber, tenantId },
      relations: ['enrollment', 'enrollment.student', 'enrollment.courseInstance', 'enrollment.courseInstance.course'],
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async update(id: string, updateDto: UpdateCertificateDto): Promise<Certificate> {
    const certificate = await this.findOne(id);
    Object.assign(certificate, updateDto);
    return this.certificateRepository.save(certificate);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.certificateRepository.softDelete(id);
  }

  async issue(id: string, issuedById?: string): Promise<Certificate> {
    return this.update(id, {
      status: CertificateStatus.ISSUED,
      issuedById,
      issuedAt: new Date(),
    });
  }

  async revoke(id: string, revokedById: string, reason: string): Promise<Certificate> {
    return this.update(id, {
      status: CertificateStatus.REVOKED,
      revokedById,
      revokedAt: new Date(),
      revocationReason: reason,
    });
  }

  async generatePdf(id: string): Promise<Certificate> {
    await this.findOne(id);
    
    // TODO: Implement PDF generation logic
    // This could use a library like PDFKit or integrate with a PDF generation service
    const pdfUrl = `/certificates/${id}.pdf`;
    
    return this.update(id, {
      status: CertificateStatus.GENERATED,
      pdfUrl,
    });
  }

  async verify(certificateNumber: string): Promise<{
    isValid: boolean;
    certificate?: Certificate;
    reason?: string;
  }> {
    try {
      const certificate = await this.findByCertificateNumber(certificateNumber);
      
      if (certificate.status === CertificateStatus.REVOKED) {
        return {
          isValid: false,
          certificate,
          reason: certificate.revocationReason || 'Certificate has been revoked',
        };
      }
      
      if (certificate.isExpired) {
        return {
          isValid: false,
          certificate,
          reason: 'Certificate has expired',
        };
      }
      
      return {
        isValid: true,
        certificate,
      };
    } catch (error) {
      return {
        isValid: false,
        reason: 'Certificate not found',
      };
    }
  }

  async getStudentCertificates(studentId: string): Promise<Certificate[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    
    return this.certificateRepository
      .createQueryBuilder('certificate')
      .leftJoinAndSelect('certificate.enrollment', 'enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.courseInstance', 'courseInstance')
      .leftJoinAndSelect('courseInstance.course', 'course')
      .where('certificate.tenantId = :tenantId', { tenantId })
      .andWhere('enrollment.studentId = :studentId', { studentId })
      .orderBy('certificate.issueDate', 'DESC')
      .getMany();
  }

  async createCompletionCertificate(enrollmentId: string): Promise<Certificate> {
    const enrollment = await this.enrollmentService.findOne(enrollmentId);
    const courseInstance = enrollment.courseInstance;
    const course = courseInstance.course;

    return this.create({
      enrollmentId,
      title: `Certificate of Completion - ${course.name}`,
      description: `This certifies that the recipient has successfully completed the course "${course.name}"`,
      type: CertificateType.COMPLETION,
    });
  }

  async bulkCreateCertificates(enrollmentIds: string[], _type: CertificateType = CertificateType.COMPLETION): Promise<Certificate[]> {
    const certificates: Certificate[] = [];
    
    for (const enrollmentId of enrollmentIds) {
      try {
        const certificate = await this.createCompletionCertificate(enrollmentId);
        certificates.push(certificate);
      } catch (error) {
        // Log error but continue with other certificates
        console.error(`Failed to create certificate for enrollment ${enrollmentId}:`, error);
      }
    }
    
    return certificates;
  }

  private async generateCertificateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const tenantId = this.tenantService.getCurrentTenantId();
    
    // Count certificates for this year and tenant
    const count = await this.certificateRepository.count({
      where: {
        tenantId,
        issueDate: Between(
          new Date(year, 0, 1),
          new Date(year, 11, 31, 23, 59, 59)
        ),
      },
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    const tenantPrefix = tenantId.substring(0, 4).toUpperCase();
    
    return `CERT-${tenantPrefix}-${year}-${sequence}`;
  }

  async getExpiringCertificates(days: number = 30): Promise<Certificate[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    return this.certificateRepository
      .createQueryBuilder('certificate')
      .where('certificate.tenantId = :tenantId', { tenantId })
      .andWhere('certificate.expirationDate IS NOT NULL')
      .andWhere('certificate.expirationDate <= :futureDate', { futureDate })
      .andWhere('certificate.expirationDate > :now', { now: new Date() })
      .andWhere('certificate.status != :revokedStatus', { revokedStatus: CertificateStatus.REVOKED })
      .leftJoinAndSelect('certificate.enrollment', 'enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .orderBy('certificate.expirationDate', 'ASC')
      .getMany();
  }
}