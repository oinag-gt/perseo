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
  CertificateService,
  CreateCertificateDto,
  UpdateCertificateDto,
  CertificateFilters,
} from '../services/certificate.service';
import { Certificate, CertificateType } from '../entities/certificate.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/v1/academic/certificates')
@UseGuards(JwtAuthGuard)
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  create(@Body() createDto: CreateCertificateDto): Promise<Certificate> {
    return this.certificateService.create(createDto);
  }

  @Post('bulk')
  bulkCreate(
    @Body() data: { enrollmentIds: string[]; type?: CertificateType },
  ): Promise<Certificate[]> {
    return this.certificateService.bulkCreateCertificates(data.enrollmentIds, data.type);
  }

  @Post('enrollment/:enrollmentId/completion')
  createCompletionCertificate(@Param('enrollmentId') enrollmentId: string): Promise<Certificate> {
    return this.certificateService.createCompletionCertificate(enrollmentId);
  }

  @Get()
  findAll(@Query() filters: CertificateFilters): Promise<Certificate[]> {
    return this.certificateService.findAll(filters);
  }

  @Get('student/:studentId')
  getStudentCertificates(@Param('studentId') studentId: string): Promise<Certificate[]> {
    return this.certificateService.getStudentCertificates(studentId);
  }

  @Get('expiring')
  getExpiringCertificates(@Query('days') days?: number): Promise<Certificate[]> {
    return this.certificateService.getExpiringCertificates(days);
  }

  @Get('verify/:certificateNumber')
  verifyCertificate(@Param('certificateNumber') certificateNumber: string): Promise<any> {
    return this.certificateService.verify(certificateNumber);
  }

  @Get('by-number/:certificateNumber')
  findByCertificateNumber(@Param('certificateNumber') certificateNumber: string): Promise<Certificate> {
    return this.certificateService.findByCertificateNumber(certificateNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Certificate> {
    return this.certificateService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCertificateDto,
  ): Promise<Certificate> {
    return this.certificateService.update(id, updateDto);
  }

  @Patch(':id/issue')
  issue(
    @Param('id') id: string,
    @Body('issuedById') issuedById?: string,
  ): Promise<Certificate> {
    return this.certificateService.issue(id, issuedById);
  }

  @Patch(':id/revoke')
  revoke(
    @Param('id') id: string,
    @Body() data: { revokedById: string; reason: string },
  ): Promise<Certificate> {
    return this.certificateService.revoke(id, data.revokedById, data.reason);
  }

  @Post(':id/generate-pdf')
  generatePdf(@Param('id') id: string): Promise<Certificate> {
    return this.certificateService.generatePdf(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.certificateService.remove(id);
  }
}