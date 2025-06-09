export enum CourseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum CourseInstanceStatus {
  PLANNED = 'planned',
  ENROLLMENT_OPEN = 'enrollment_open',
  ENROLLMENT_CLOSED = 'enrollment_closed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EnrollmentStatus {
  PENDING = 'pending',
  WAITLISTED = 'waitlisted',
  ENROLLED = 'enrolled',
  DROPPED = 'dropped',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  REFUNDED = 'refunded',
}

export enum ScheduleType {
  CLASS = 'class',
  EXAM = 'exam',
  WORKSHOP = 'workshop',
  FIELD_TRIP = 'field_trip',
  HOLIDAY = 'holiday',
  MAKEUP = 'makeup',
}

export enum ScheduleStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  RESCHEDULED = 'rescheduled',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  PARTIAL = 'partial',
}

export enum GradeType {
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  MIDTERM = 'midterm',
  FINAL = 'final',
  PROJECT = 'project',
  PARTICIPATION = 'participation',
  ATTENDANCE = 'attendance',
  EXTRA_CREDIT = 'extra_credit',
}

export enum GradeScale {
  PERCENTAGE = 'percentage',
  POINTS = 'points',
  LETTER = 'letter',
  PASS_FAIL = 'pass_fail',
}

export enum CertificateStatus {
  PENDING = 'pending',
  GENERATED = 'generated',
  ISSUED = 'issued',
  REVOKED = 'revoked',
}

export enum CertificateType {
  COMPLETION = 'completion',
  ACHIEVEMENT = 'achievement',
  PARTICIPATION = 'participation',
  PROFICIENCY = 'proficiency',
}

// Type interfaces
export interface CourseRequirements {
  prerequisites: string[];
  minimumAge?: number;
  maximumAge?: number;
  requiredDocuments: string[];
}

export interface CourseMaterials {
  syllabus?: string;
  textbooks: string[];
  additionalResources: string[];
}

export interface ScheduleInfo {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
}

export interface EnrollmentMetadata {
  enrollmentSource?: string;
  discountCode?: string;
  specialRequirements?: string[];
  emergencyContactOverride?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface CertificateMetadata {
  templateId?: string;
  customFields?: Record<string, any>;
  digitalSignature?: string;
  verificationCode?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  shortDescription?: string;
  status: CourseStatus;
  level: CourseLevel;
  category: string;
  tags?: string[];
  durationHours: number;
  maxStudents: number;
  minStudents: number;
  price?: number;
  currency?: string;
  requirements?: CourseRequirements;
  materials?: CourseMaterials;
  imageUrl?: string;
  notes?: string;
  instructorId?: string;
  instructor?: any;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  instances?: CourseInstance[];
}

export interface CourseInstance {
  id: string;
  name: string;
  code: string;
  status: CourseInstanceStatus;
  startDate: Date;
  endDate: Date;
  enrollmentStartDate: Date;
  enrollmentEndDate: Date;
  maxStudents?: number;
  minStudents?: number;
  price?: number;
  currency?: string;
  schedule: ScheduleInfo[];
  location?: string;
  notes?: string;
  courseId: string;
  course?: Course;
  instructorId?: string;
  instructor?: any;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  enrollments?: Enrollment[];
  schedules?: Schedule[];
  attendanceRecords?: AttendanceRecord[];
  enrolledStudents: number;
  availableSlots: number;
}

export interface Enrollment {
  id: string;
  status: EnrollmentStatus;
  enrollmentDate: Date;
  completionDate?: Date;
  dropDate?: Date;
  paymentStatus: PaymentStatus;
  amountPaid?: number;
  amountDue?: number;
  discountAmount?: number;
  dropReason?: string;
  metadata?: EnrollmentMetadata;
  notes?: string;
  studentId: string;
  student?: any;
  courseInstanceId: string;
  courseInstance?: CourseInstance;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  grades?: Grade[];
  attendanceRecords?: AttendanceRecord[];
  finalGrade: number | null;
  attendancePercentage: number;
}

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  type: ScheduleType;
  status: ScheduleStatus;
  startDateTime: Date;
  endDateTime: Date;
  location?: string;
  room?: string;
  agenda?: string;
  materials?: string;
  homework?: string;
  notes?: string;
  cancellationReason?: string;
  originalScheduleId?: string;
  originalSchedule?: Schedule;
  courseInstanceId: string;
  courseInstance?: CourseInstance;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  duration: number;
  isToday: boolean;
}

export interface AttendanceRecord {
  id: string;
  date: Date;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  minutesLate?: number;
  minutesPresent?: number;
  notes?: string;
  excuseReason?: string;
  recordedById?: string;
  recordedAt?: Date;
  enrollmentId: string;
  enrollment?: Enrollment;
  courseInstanceId: string;
  courseInstance?: CourseInstance;
  scheduleId?: string;
  schedule?: Schedule;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isPresent: boolean;
  isExcused: boolean;
}

export interface Grade {
  id: string;
  name: string;
  description?: string;
  type: GradeType;
  scale: GradeScale;
  score: number;
  maxScore: number;
  weight?: number;
  letterGrade?: string;
  isPassing: boolean;
  dueDate?: Date;
  submissionDate?: Date;
  feedback?: string;
  notes?: string;
  isExtraCredit: boolean;
  isDropped: boolean;
  enrollmentId: string;
  enrollment?: Enrollment;
  gradedById?: string;
  gradedBy?: any;
  gradedAt?: Date;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  percentage: number;
  isLate: boolean;
  weightedScore: number;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  title: string;
  description?: string;
  type: CertificateType;
  status: CertificateStatus;
  issueDate: Date;
  expirationDate?: Date;
  finalGrade?: number;
  gradeScale?: string;
  creditsEarned?: number;
  pdfUrl?: string;
  digitalSignatureUrl?: string;
  metadata?: CertificateMetadata;
  notes?: string;
  enrollmentId: string;
  enrollment?: Enrollment;
  issuedById?: string;
  issuedBy?: any;
  issuedAt?: Date;
  revokedById?: string;
  revokedBy?: any;
  revokedAt?: Date;
  revocationReason?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isValid: boolean;
  isExpired: boolean;
  verificationUrl: string;
}

// Stats and analytics interfaces
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

export interface AttendanceStats {
  totalSessions: number;
  presentSessions: number;
  absentSessions: number;
  excusedSessions: number;
  lateSessions: number;
  attendancePercentage: number;
}