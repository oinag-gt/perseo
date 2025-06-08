# PERSEO - Platform for Educational Resources, Services, Enrollment & Operations

## Executive Summary

PERSEO is a comprehensive multi-tenant SaaS platform designed to manage educational and cultural centers. It provides modules for people management, academic control, financial operations, and administrative tasks.

## System Architecture

### Core Principles
- **Multi-tenant**: Single application instance serving multiple organizations
- **Modular**: Loosely coupled modules that can be enabled/disabled per tenant
- **Scalable**: Designed to handle growth from small centers to large institutions
- **Secure**: Role-based access control with data isolation between tenants
- **Auditable**: Complete audit trail for compliance and accountability

## Detailed Module Specifications

### 1. People Module (Identity & Relationship Management)

#### Purpose
Central repository for all individuals interacting with the educational center, providing a single source of truth for identity management.

#### Core Entities

##### Person
```typescript
interface Person {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
  alternateEmails?: string[];
  phone: string;
  alternatePhones?: string[];
  birthDate: Date;
  nationalId: string;
  nationalIdType: 'DNI' | 'PASSPORT' | 'OTHER';
  gender?: 'M' | 'F' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  address: Address;
  emergencyContact: EmergencyContact;
  preferredLanguage: 'es' | 'en';
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  documents: Document[];
  photoUrl?: string;
  notes?: string;
  tags?: string[]; // For flexible categorization
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // Soft delete
}
```

##### Group
```typescript
interface Group {
  id: UUID;
  name: string;
  description: string;
  type: 'ADMINISTRATIVE' | 'ACADEMIC' | 'SOCIAL' | 'OTHER';
  parentGroupId?: UUID;
  leaderId?: UUID; // References Person
  maxMembers?: number;
  isActive: boolean;
  metadata?: Record<string, any>;
}
```

##### GroupMembership
```typescript
interface GroupMembership {
  id: UUID;
  personId: UUID;
  groupId: UUID;
  role: 'MEMBER' | 'LEADER' | 'COORDINATOR';
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  reason?: string; // For status changes
  addedBy: UUID; // User who added this membership
}
```

#### Business Rules
- A person can belong to multiple groups simultaneously
- Group hierarchies support unlimited nesting levels
- All group membership changes are logged with timestamp and user
- Duplicate person detection based on email/nationalId

### 2. Academic Control Module

#### Purpose
Manages the complete academic lifecycle from course design to student completion and certification.

#### Core Entities

##### Course (Template)
```typescript
interface Course {
  id: UUID;
  code: string; // e.g., "LANG-ENG-101"
  name: string;
  description: string;
  category: string;
  tags: string[];
  duration: {
    value: number;
    unit: 'HOURS' | 'DAYS' | 'WEEKS' | 'MONTHS';
  };
  maxStudents: number;
  minStudents: number;
  prerequisites?: UUID[]; // Other course IDs
  learningObjectives: string[];
  targetAudience: string;
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  materials?: CourseMaterial[];
  defaultPrice: Money;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
```

##### CourseInstance
```typescript
interface CourseInstance {
  id: UUID;
  courseId: UUID;
  code: string; // e.g., "LANG-ENG-101-2024Q1"
  instructorId: UUID; // References Person
  assistantInstructorIds?: UUID[];
  schedule: Schedule;
  location: Location | 'ONLINE';
  startDate: Date;
  endDate: Date;
  enrollmentStartDate: Date;
  enrollmentEndDate: Date;
  offers: CourseOffer[];
  status: 'PLANNED' | 'OPEN_ENROLLMENT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  maxStudents: number; // Can override course default
  currentEnrollment: number;
  waitlistEnabled: boolean;
}
```

##### Enrollment
```typescript
interface Enrollment {
  id: UUID;
  courseInstanceId: UUID;
  studentId: UUID; // References Person
  status: 'INTERESTED' | 'WAITLISTED' | 'PRE_ENROLLED' | 'ENROLLED' | 'COMPLETED' | 'DROPPED';
  enrollmentDate: Date;
  statusHistory: StatusChange[];
  attendance: AttendanceRecord[];
  grade?: Grade;
  certificateId?: UUID;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'WAIVED';
  notes?: string;
}
```

#### Business Rules
- Course templates are reusable across multiple instances
- Enrollment workflow: INTERESTED → PRE_ENROLLED → ENROLLED
- Automatic waitlist management when course is full
- Attendance tracking with configurable minimum attendance for certification
- Grade recording with pass/fail thresholds
- Certificate generation with customizable templates

### 3. Financial Module - Accounts Receivable

#### Purpose
Manages all incoming revenue streams including course fees, membership dues, and other charges.

#### Core Entities

##### Invoice
```typescript
interface Invoice {
  id: UUID;
  invoiceNumber: string; // Sequential per tenant
  personId: UUID;
  issueDate: Date;
  dueDate: Date;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  lineItems: InvoiceLineItem[];
  subtotal: Money;
  taxAmount: Money;
  totalAmount: Money;
  paidAmount: Money;
  paymentTransactions: PaymentTransaction[];
  notes?: string;
}
```

##### InvoiceLineItem
```typescript
interface InvoiceLineItem {
  id: UUID;
  description: string;
  quantity: number;
  unitPrice: Money;
  amount: Money;
  taxRate: number;
  source: {
    type: 'COURSE_ENROLLMENT' | 'MEMBERSHIP' | 'OTHER';
    referenceId: UUID;
  };
}
```

##### BillingProfile
```typescript
interface BillingProfile {
  id: UUID;
  name: string;
  description?: string;
  amount: Money;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  scope: {
    type: 'DEFAULT' | 'GROUP' | 'PERSON';
    referenceId?: UUID; // Group ID or Person ID
  };
  priority: number; // Higher number = higher priority
  conditions?: BillingCondition[]; // e.g., financial hardship, scholarship
  validFrom: Date;
  validTo?: Date;
  isActive: boolean;
  createdBy: UUID;
  reason?: string; // For audit trail, especially for exceptions
}

interface BillingCondition {
  type: 'FINANCIAL_HARDSHIP' | 'SCHOLARSHIP' | 'EMPLOYEE' | 'CUSTOM';
  parameters?: Record<string, any>;
}
```

##### RecurringCharge
```typescript
interface RecurringCharge {
  id: UUID;
  personId: UUID;
  billingProfileId: UUID; // References the applicable BillingProfile
  description: string;
  amount: Money; // Calculated from BillingProfile
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  startDate: Date;
  endDate?: Date;
  nextChargeDate: Date;
  isActive: boolean;
  source: {
    type: 'GROUP_MEMBERSHIP' | 'SUBSCRIPTION' | 'OTHER';
    referenceId: UUID;
  };
  appliedProfileHistory: ProfileApplication[]; // Track which profiles were applied
}

interface ProfileApplication {
  billingProfileId: UUID;
  appliedAt: Date;
  amount: Money;
  reason?: string;
}
```

#### Business Rules
- Automatic invoice generation based on enrollments and recurring charges
- Configurable payment terms and late fees
- Support for partial payments and payment plans
- Integration-ready for payment gateways (Stripe, PayPal, etc.)
- Automatic email reminders for overdue invoices

##### Billing Profile Precedence Rules
When determining the applicable charge for a person, the system evaluates billing profiles in the following precedence order (highest to lowest):

1. **Person-specific profile** (priority 1000+): Individual exceptions for financial hardship or special circumstances
2. **Subgroup profile** (priority 100-999): Specific rates for subgroups (e.g., "students" within "members")
3. **Group profile** (priority 10-99): Standard rates for group memberships (e.g., "members")
4. **Default profile** (priority 0-9): Fallback rates when no specific profile applies

##### Billing Examples

**Scenario 1: Standard Member**
- Person belongs to "members" group
- Applicable profile: Group profile for "members" ($30/month)
- Result: $30 monthly charge

**Scenario 2: Student Member**
- Person belongs to "members" group AND "students" subgroup
- Applicable profiles: 
  - Group profile for "members" ($30/month, priority 10)
  - Group profile for "students" ($20/month, priority 50)
- Result: $20 monthly charge (higher priority wins)

**Scenario 3: Financial Hardship Exception**
- Person belongs to "members" group with financial hardship
- Applicable profiles:
  - Group profile for "members" ($30/month, priority 10)
  - Person-specific profile ($15/month, priority 1000, condition: FINANCIAL_HARDSHIP)
- Result: $15 monthly charge (highest priority)

##### Billing Profile Management
- All billing profile changes require approval and audit trail
- Profiles can have validity periods (e.g., 6-month financial hardship exception)
- Historical tracking of which profiles were applied to each charge
- Automatic expiration handling with notifications


### 4. Financial Module - Accounts Payable

#### Purpose
Manages outgoing payments, primarily instructor compensation based on configurable payment profiles.

#### Core Entities

##### PaymentProfile
```typescript
interface PaymentProfile {
  id: UUID;
  name: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'HOURLY_RATE';
  value: number; // Percentage (0-100), fixed amount, or hourly rate
  scope: {
    type: 'DEFAULT' | 'INSTRUCTOR' | 'COURSE' | 'COURSE_INSTANCE';
    referenceId?: UUID;
  };
  priority: number; // For precedence rules
  conditions?: PaymentCondition[];
  isActive: boolean;
}
```

##### PayableInvoice
```typescript
interface PayableInvoice {
  id: UUID;
  instructorId: UUID;
  period: {
    startDate: Date;
    endDate: Date;
  };
  lineItems: PayableLineItem[];
  totalAmount: Money;
  status: 'DRAFT' | 'APPROVED' | 'PAID' | 'CANCELLED';
  paymentMethod?: 'BANK_TRANSFER' | 'CHECK' | 'CASH';
  paymentReference?: string;
  approvedBy?: UUID;
  approvedAt?: Date;
  paidAt?: Date;
}
```

#### Business Rules
- Payment profile precedence: CourseInstance > Course > Instructor > Default
- Automatic calculation based on student payments received
- Monthly batch processing with manual override capability
- Approval workflow for payable invoices
- Tax withholding calculations where applicable

## System-Wide Features

### Multi-Tenancy Architecture

#### Implementation Strategy
- **Database**: PostgreSQL with schema-based isolation
- **Each tenant** gets a dedicated schema
- **Shared schema** for system-wide data (users, tenants)
- **Connection pooling** per tenant for performance

#### Tenant Management
```typescript
interface Tenant {
  id: UUID;
  name: string;
  subdomain: string; // e.g., "oxford" for oxford.perseo.app
  customDomain?: string; // e.g., "portal.oxfordschool.com"
  plan: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
  settings: TenantSettings;
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  limits: {
    maxUsers: number;
    maxStudents: number;
    maxCourses: number;
  };
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}
```

### User Management & Authorization

#### Authentication Strategy
- **Phase 1**: Custom JWT implementation using bcrypt for password hashing
- **Phase 2**: Migration path to Azure AD B2C when enterprise features needed (SSO, social logins)

#### User Model
```typescript
interface User {
  id: UUID;
  email: string;
  passwordHash: string; // bcrypt hashed
  personId?: UUID; // Link to person if applicable
  tenants: TenantAccess[];
  mfaEnabled: boolean;
  mfaSecret?: string; // For TOTP-based 2FA
  refreshTokens: RefreshToken[]; // Track active sessions
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  isActive: boolean;
}

interface RefreshToken {
  id: UUID;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

interface TenantAccess {
  tenantId: UUID;
  roles: Role[];
  modules: ModuleAccess[];
}

interface ModuleAccess {
  module: 'PEOPLE' | 'ACADEMIC' | 'RECEIVABLES' | 'PAYABLES' | 'REPORTS';
  permissions: Permission[];
  accountIds?: UUID[]; // For account-level restrictions
}
```

#### Permission Model
- Role-Based Access Control (RBAC) with granular permissions
- Predefined roles: SUPER_ADMIN, TENANT_ADMIN, DIRECTOR, COORDINATOR, INSTRUCTOR, STUDENT
- Custom role creation per tenant
- API-level permission enforcement

### Internationalization (i18n)

#### Implementation
- All user-facing text in translation files
- Support for Spanish (primary) and English
- Date/time formatting per locale
- Currency formatting with multi-currency support
- RTL language support ready

### API Design

#### RESTful API Structure
```
/api/v1/
  /auth
    POST   /login
    POST   /logout
    POST   /refresh
  /people
    GET    /persons
    POST   /persons
    GET    /persons/:id
    PUT    /persons/:id
    DELETE /persons/:id
  /academic
    GET    /courses
    POST   /courses
    GET    /course-instances
    POST   /enrollments
  /financial
    GET    /invoices
    POST   /invoices
    GET    /payments
```

#### API Features
- JSON:API
- Pagination, filtering, and sorting
- Field selection for bandwidth optimization
- Webhook support for integrations
- Rate limiting per tenant/plan

## Technology Stack Recommendation

### Selected Choice: Node.js Ecosystem

#### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS (enterprise-grade architecture)
- **Language**: TypeScript (type safety)
- **ORM**: TypeORM
- **Database**: PostgreSQL 15+
- **Cache**: Redis
- **Queue**: Bull (Redis-based)

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **State Management**: Zustand or TanStack Query
- **Styling**: Tailwind CSS + Radix UI
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table

#### Infrastructure (Azure-based)
- **Authentication**: Custom JWT implementation with bcrypt (migration path to Azure AD B2C)
- **File Storage**: Azure Blob Storage
- **Email**: Azure Communication Services or SendGrid
- **Monitoring**: Azure Application Insights + Grafana
- **CI/CD**: GitHub Actions with Azure DevOps integration
- **Hosting**: 
  - Frontend: Azure Static Web Apps
  - Backend: Azure App Service or Azure Container Instances
  - Database: Azure Database for PostgreSQL
  - Cache: Azure Cache for Redis
- **CDN**: Azure CDN
- **Secrets Management**: Azure Key Vault


## Development Roadmap

### Phase 1: Foundation (Months 1-2)
1. Set up development environment and CI/CD
2. Implement multi-tenant architecture
3. User authentication and authorization
4. Basic CRUD for People module
5. Database migrations and seeding

### Phase 2: Core Modules (Months 3-4)
1. Complete People module with groups
2. Academic Control module (courses, instances)
3. Basic enrollment workflow
4. Simple reporting

### Phase 3: Financial Features (Months 5-6)
1. Accounts Receivable (invoicing)
2. Payment gateway integration
3. Accounts Payable (instructor payments)
4. Financial reports

### Phase 4: Polish & Launch (Month 7)
1. Multi-language support
2. Email notifications
3. Performance optimization
4. Security audit
5. Documentation
6. Beta testing

## Security Considerations

1. **Data Isolation**: Strict tenant separation at database level
2. **Encryption**: 
   - Data at rest: Azure Transparent Data Encryption
   - Data in transit: TLS 1.3
   - Sensitive fields: Additional application-level encryption
3. **Authentication**: 
   - Custom JWT implementation with secure refresh token rotation
   - bcrypt with cost factor 12 for password hashing
   - Account lockout after 5 failed attempts
   - Optional TOTP-based MFA
4. **Authorization**: Fine-grained permissions per module
5. **Audit Logging**: All data modifications tracked in Azure Table Storage
6. **GDPR Compliance**: Data export, right to be forgotten
7. **Regular Security Audits**: Penetration testing
8. **Backup Strategy**: 
   - Azure Backup for database (daily with 30-day retention)
   - Geo-redundant storage for critical data
   - Point-in-time recovery capability

## Scalability Considerations

1. **Database**: Azure Database for PostgreSQL with read replicas
2. **Caching**: Azure Cache for Redis for session and frequently accessed data
3. **File Storage**: Azure CDN for static assets and media files
4. **Background Jobs**: Bull queue with Redis backend (Azure Cache for Redis)
5. **Horizontal Scaling**: 
   - Azure App Service auto-scaling
   - Stateless application design
   - Azure Load Balancer for traffic distribution
6. **Monitoring**: 
   - Azure Application Insights for APM
   - Azure Monitor for infrastructure metrics
   - Custom dashboards in Grafana

## Success Metrics

1. **Performance**: Page load under 2 seconds
2. **Availability**: 99.9% uptime SLA
3. **Security**: Zero data breaches
4. **User Satisfaction**: NPS score > 50
5. **Scalability**: Support 100+ concurrent users per tenant