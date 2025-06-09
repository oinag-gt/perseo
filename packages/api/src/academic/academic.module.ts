import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseInstance } from './entities/course-instance.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Schedule } from './entities/schedule.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { Grade } from './entities/grade.entity';
import { Certificate } from './entities/certificate.entity';
import { CourseService } from './services/course.service';
import { CourseInstanceService } from './services/course-instance.service';
import { EnrollmentService } from './services/enrollment.service';
import { ScheduleService } from './services/schedule.service';
import { AttendanceService } from './services/attendance.service';
import { GradeService } from './services/grade.service';
import { CertificateService } from './services/certificate.service';
import { CourseController } from './controllers/course.controller';
import { CourseInstanceController } from './controllers/course-instance.controller';
import { EnrollmentController } from './controllers/enrollment.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { AttendanceController } from './controllers/attendance.controller';
import { GradeController } from './controllers/grade.controller';
import { CertificateController } from './controllers/certificate.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseInstance,
      Enrollment,
      Schedule,
      AttendanceRecord,
      Grade,
      Certificate,
    ]),
  ],
  controllers: [
    CourseController,
    CourseInstanceController,
    EnrollmentController,
    ScheduleController,
    AttendanceController,
    GradeController,
    CertificateController,
  ],
  providers: [
    CourseService,
    CourseInstanceService,
    EnrollmentService,
    ScheduleService,
    AttendanceService,
    GradeService,
    CertificateService,
  ],
  exports: [
    CourseService,
    CourseInstanceService,
    EnrollmentService,
    ScheduleService,
    AttendanceService,
    GradeService,
    CertificateService,
  ],
})
export class AcademicModule {}