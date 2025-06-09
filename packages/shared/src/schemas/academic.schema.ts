import { z } from 'zod';

// Enums as Zod schemas
export const CourseStatusSchema = z.enum(['draft', 'active', 'archived']);
export const CourseLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);
export const CourseInstanceStatusSchema = z.enum([
  'planned',
  'enrollment_open',
  'enrollment_closed',
  'in_progress',
  'completed',
  'cancelled'
]);
export const EnrollmentStatusSchema = z.enum([
  'pending',
  'waitlisted',
  'enrolled',
  'dropped',
  'completed',
  'failed',
  'cancelled'
]);
export const PaymentStatusSchema = z.enum(['pending', 'partial', 'paid', 'overdue', 'refunded']);
export const ScheduleTypeSchema = z.enum([
  'class',
  'exam',
  'workshop',
  'field_trip',
  'holiday',
  'makeup'
]);
export const ScheduleStatusSchema = z.enum([
  'scheduled',
  'confirmed',
  'cancelled',
  'completed',
  'rescheduled'
]);
export const AttendanceStatusSchema = z.enum(['present', 'absent', 'late', 'excused', 'partial']);
export const GradeTypeSchema = z.enum([
  'quiz',
  'assignment',
  'midterm',
  'final',
  'project',
  'participation',
  'attendance',
  'extra_credit'
]);
export const GradeScaleSchema = z.enum(['percentage', 'points', 'letter', 'pass_fail']);
export const CertificateStatusSchema = z.enum(['pending', 'generated', 'issued', 'revoked']);
export const CertificateTypeSchema = z.enum(['completion', 'achievement', 'participation', 'proficiency']);

// Complex object schemas
export const CourseRequirementsSchema = z.object({
  prerequisites: z.array(z.string()),
  minimumAge: z.number().optional(),
  maximumAge: z.number().optional(),
  requiredDocuments: z.array(z.string()),
});

export const CourseMaterialsSchema = z.object({
  syllabus: z.string().optional(),
  textbooks: z.array(z.string()),
  additionalResources: z.array(z.string()),
});

export const ScheduleInfoSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().optional(),
});

export const EnrollmentMetadataSchema = z.object({
  enrollmentSource: z.string().optional(),
  discountCode: z.string().optional(),
  specialRequirements: z.array(z.string()).optional(),
  emergencyContactOverride: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
});

export const CertificateMetadataSchema = z.object({
  templateId: z.string().optional(),
  customFields: z.record(z.any()).optional(),
  digitalSignature: z.string().optional(),
  verificationCode: z.string().optional(),
});

// Course schemas
export const CreateCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  code: z.string().min(1, 'Course code is required'),
  description: z.string().min(1, 'Course description is required'),
  shortDescription: z.string().optional(),
  level: CourseLevelSchema,
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  durationHours: z.number().min(1, 'Duration must be at least 1 hour'),
  maxStudents: z.number().min(1).optional(),
  minStudents: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  requirements: CourseRequirementsSchema.optional(),
  materials: CourseMaterialsSchema.optional(),
  imageUrl: z.string().url().optional(),
  notes: z.string().optional(),
  instructorId: z.string().uuid().optional(),
});

export const UpdateCourseSchema = CreateCourseSchema.partial().extend({
  status: CourseStatusSchema.optional(),
});

// Course Instance schemas
export const CreateCourseInstanceSchema = z.object({
  name: z.string().min(1, 'Instance name is required'),
  code: z.string().min(1, 'Instance code is required'),
  courseId: z.string().uuid('Valid course ID is required'),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  enrollmentStartDate: z.string().transform((str) => new Date(str)),
  enrollmentEndDate: z.string().transform((str) => new Date(str)),
  maxStudents: z.number().min(1).optional(),
  minStudents: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  schedule: z.array(ScheduleInfoSchema),
  location: z.string().optional(),
  notes: z.string().optional(),
  instructorId: z.string().uuid().optional(),
});

export const UpdateCourseInstanceSchema = CreateCourseInstanceSchema.partial().extend({
  status: CourseInstanceStatusSchema.optional(),
});

// Enrollment schemas
export const CreateEnrollmentSchema = z.object({
  studentId: z.string().uuid('Valid student ID is required'),
  courseInstanceId: z.string().uuid('Valid course instance ID is required'),
  paymentStatus: PaymentStatusSchema.optional(),
  amountPaid: z.number().min(0).optional(),
  amountDue: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  metadata: EnrollmentMetadataSchema.optional(),
  notes: z.string().optional(),
});

export const UpdateEnrollmentSchema = CreateEnrollmentSchema.partial().extend({
  status: EnrollmentStatusSchema.optional(),
  completionDate: z.string().transform((str) => new Date(str)).optional(),
  dropDate: z.string().transform((str) => new Date(str)).optional(),
  dropReason: z.string().optional(),
});

// Schedule schemas
export const CreateScheduleSchema = z.object({
  title: z.string().min(1, 'Schedule title is required'),
  description: z.string().optional(),
  type: ScheduleTypeSchema,
  startDateTime: z.string().transform((str) => new Date(str)),
  endDateTime: z.string().transform((str) => new Date(str)),
  location: z.string().optional(),
  room: z.string().optional(),
  agenda: z.string().optional(),
  materials: z.string().optional(),
  homework: z.string().optional(),
  notes: z.string().optional(),
  courseInstanceId: z.string().uuid('Valid course instance ID is required'),
});

export const UpdateScheduleSchema = CreateScheduleSchema.partial().extend({
  status: ScheduleStatusSchema.optional(),
  cancellationReason: z.string().optional(),
});

// Attendance schemas
export const CreateAttendanceSchema = z.object({
  enrollmentId: z.string().uuid('Valid enrollment ID is required'),
  courseInstanceId: z.string().uuid('Valid course instance ID is required'),
  scheduleId: z.string().uuid().optional(),
  date: z.string().transform((str) => new Date(str)),
  status: AttendanceStatusSchema,
  checkInTime: z.string().transform((str) => new Date(str)).optional(),
  checkOutTime: z.string().transform((str) => new Date(str)).optional(),
  minutesLate: z.number().min(0).optional(),
  minutesPresent: z.number().min(0).optional(),
  notes: z.string().optional(),
  excuseReason: z.string().optional(),
  recordedById: z.string().uuid().optional(),
});

export const UpdateAttendanceSchema = CreateAttendanceSchema.partial();

export const BulkAttendanceSchema = z.object({
  courseInstanceId: z.string().uuid('Valid course instance ID is required'),
  scheduleId: z.string().uuid().optional(),
  date: z.string().transform((str) => new Date(str)),
  records: z.array(z.object({
    enrollmentId: z.string().uuid(),
    status: AttendanceStatusSchema,
    checkInTime: z.string().transform((str) => new Date(str)).optional(),
    checkOutTime: z.string().transform((str) => new Date(str)).optional(),
    minutesLate: z.number().min(0).optional(),
    notes: z.string().optional(),
    excuseReason: z.string().optional(),
  })),
  recordedById: z.string().uuid().optional(),
});

// Grade schemas
export const CreateGradeSchema = z.object({
  enrollmentId: z.string().uuid('Valid enrollment ID is required'),
  name: z.string().min(1, 'Grade name is required'),
  description: z.string().optional(),
  type: GradeTypeSchema,
  scale: GradeScaleSchema.optional(),
  score: z.number().min(0),
  maxScore: z.number().min(1),
  weight: z.number().min(0).max(100).optional(),
  letterGrade: z.string().optional(),
  dueDate: z.string().transform((str) => new Date(str)).optional(),
  submissionDate: z.string().transform((str) => new Date(str)).optional(),
  feedback: z.string().optional(),
  notes: z.string().optional(),
  isExtraCredit: z.boolean().optional(),
  gradedById: z.string().uuid().optional(),
});

export const UpdateGradeSchema = CreateGradeSchema.partial().extend({
  isDropped: z.boolean().optional(),
});

// Certificate schemas
export const CreateCertificateSchema = z.object({
  enrollmentId: z.string().uuid('Valid enrollment ID is required'),
  title: z.string().min(1, 'Certificate title is required'),
  description: z.string().optional(),
  type: CertificateTypeSchema.optional(),
  issueDate: z.string().transform((str) => new Date(str)).optional(),
  expirationDate: z.string().transform((str) => new Date(str)).optional(),
  finalGrade: z.number().min(0).max(100).optional(),
  gradeScale: z.string().optional(),
  creditsEarned: z.number().min(0).optional(),
  metadata: CertificateMetadataSchema.optional(),
  notes: z.string().optional(),
  issuedById: z.string().uuid().optional(),
});

export const UpdateCertificateSchema = CreateCertificateSchema.partial().extend({
  status: CertificateStatusSchema.optional(),
  pdfUrl: z.string().url().optional(),
  digitalSignatureUrl: z.string().url().optional(),
});

// Filter schemas
export const CourseFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  level: CourseLevelSchema.optional(),
  status: CourseStatusSchema.optional(),
  instructorId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

export const CourseInstanceFiltersSchema = z.object({
  search: z.string().optional(),
  courseId: z.string().uuid().optional(),
  status: CourseInstanceStatusSchema.optional(),
  instructorId: z.string().uuid().optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
});

export const EnrollmentFiltersSchema = z.object({
  studentId: z.string().uuid().optional(),
  courseInstanceId: z.string().uuid().optional(),
  status: EnrollmentStatusSchema.optional(),
  paymentStatus: PaymentStatusSchema.optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
});

export const ScheduleFiltersSchema = z.object({
  courseInstanceId: z.string().uuid().optional(),
  type: ScheduleTypeSchema.optional(),
  status: ScheduleStatusSchema.optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  location: z.string().optional(),
});

export const AttendanceFiltersSchema = z.object({
  enrollmentId: z.string().uuid().optional(),
  courseInstanceId: z.string().uuid().optional(),
  scheduleId: z.string().uuid().optional(),
  status: AttendanceStatusSchema.optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
});

export const GradeFiltersSchema = z.object({
  enrollmentId: z.string().uuid().optional(),
  type: GradeTypeSchema.optional(),
  scale: GradeScaleSchema.optional(),
  isDropped: z.boolean().optional(),
  isExtraCredit: z.boolean().optional(),
});

export const CertificateFiltersSchema = z.object({
  enrollmentId: z.string().uuid().optional(),
  type: CertificateTypeSchema.optional(),
  status: CertificateStatusSchema.optional(),
  isExpired: z.boolean().optional(),
  issueYear: z.number().optional(),
});