# PERSEO Implementation Plan

## Overview

This document outlines the detailed implementation plan for PERSEO - Platform for Educational Resources, Services, Enrollment & Operations. The plan is structured to deliver a working MVP within 7 months while maintaining high code quality and scalability.

## Prerequisites Required Before Starting

### 1. Azure Account Setup
- [ ] Azure subscription with NGO discount activated
- [ ] Resource group created for PERSEO project
- [ ] Azure DevOps project (optional, for CI/CD)
- [ ] Budget alerts configured

### 2. Development Environment
- [ ] Node.js 20 LTS installed
- [ ] PostgreSQL 15+ installed locally or Docker setup
- [ ] Redis installed locally or Docker setup
- [ ] VS Code or preferred IDE with TypeScript support
- [ ] Git configured with SSH keys for GitHub

### 3. Third-Party Services
- [ ] GitHub organization access (oinag-gt)
- [ ] Domain name for the application (e.g., perseo.app)
- [ ] SSL certificates (can use Let's Encrypt)
- [ ] SMTP credentials for Outlook/Office 365
- [ ] Stripe or preferred payment gateway account (for Phase 3)

### 4. Design Assets
- [ ] Logo and branding guidelines
- [ ] Color palette and typography choices
- [ ] UI/UX mockups or wireframes (optional but recommended)

### 5. Business Information
- [ ] List of initial groups (e.g., members, students, instructors)
- [ ] Billing profiles and pricing structure
- [ ] Course categories and initial course templates
- [ ] User roles and permissions matrix
- [ ] Sample data for testing (persons, courses, etc.)

## Implementation Phases

### Phase 0: Project Setup (Week 1-2)

#### Backend Setup
```bash
# Monorepo structure
perseo/
├── packages/
│   ├── api/          # NestJS backend
│   ├── web/          # Next.js frontend
│   └── shared/       # Shared types and utilities
├── docker-compose.yml
├── package.json
├── turbo.json
└── README.md
```

**Tasks:**
1. **Initialize Monorepo**
   - Set up npm workspaces or Lerna
   - Configure Turborepo for build optimization
   - Set up TypeScript configuration
   - Configure ESLint and Prettier

2. **Backend Foundation (api package)**
   - Initialize NestJS application
   - Configure TypeORM with PostgreSQL
   - Set up Redis connection
   - Configure Bull for job queues
   - Environment configuration (.env structure)

3. **Frontend Foundation (web package)**
   - Initialize Next.js 14 with App Router
   - Configure Tailwind CSS
   - Set up Radix UI components
   - Configure React Hook Form + Zod
   - Set up i18n for Spanish/English

4. **Shared Package**
   - Define TypeScript interfaces from specs
   - Create validation schemas (Zod)
   - Utility functions
   - Constants and enums

5. **Development Infrastructure**
   - Docker Compose for local development
   - Database migrations setup
   - Seed data scripts
   - Git hooks (Husky) for code quality

### Phase 1: Foundation - Authentication & Multi-tenancy (Week 3-6)

#### 1.1 Database Schema
**Entities to implement:**
- Tenant
- User
- RefreshToken
- AuditLog

**Tasks:**
- Create TypeORM entities
- Set up schema-based multi-tenancy
- Database migrations
- Connection management per tenant

#### 1.2 Authentication System
**Endpoints:**
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- POST /api/v1/auth/refresh
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- POST /api/v1/auth/verify-email

**Features:**
- JWT with refresh tokens
- bcrypt password hashing (cost factor 12)
- Email verification flow
- Password reset flow
- Account lockout mechanism
- Session management

#### 1.3 Multi-tenant Architecture
**Implementation:**
- Tenant resolution middleware
- Schema switching based on subdomain/domain
- Tenant-aware repositories
- Cross-tenant data isolation

#### 1.4 Frontend Auth Pages
- Login page with form validation
- Registration page
- Password reset flow
- Email verification page
- Protected route wrapper

### Phase 2: People Module (Week 7-10)

#### 2.1 Database Schema
**Entities:**
- Person
- Group
- GroupMembership
- Address
- EmergencyContact
- Document

#### 2.2 API Endpoints
**Person Management:**
- GET /api/v1/people/persons
- POST /api/v1/people/persons
- GET /api/v1/people/persons/:id
- PUT /api/v1/people/persons/:id
- DELETE /api/v1/people/persons/:id (soft delete)

**Group Management:**
- GET /api/v1/people/groups
- POST /api/v1/people/groups
- GET /api/v1/people/groups/:id
- PUT /api/v1/people/groups/:id
- DELETE /api/v1/people/groups/:id

**Membership Management:**
- POST /api/v1/people/groups/:groupId/members
- DELETE /api/v1/people/groups/:groupId/members/:personId
- PUT /api/v1/people/groups/:groupId/members/:personId

#### 2.3 Business Logic
- Duplicate person detection
- Group hierarchy management
- Membership history tracking
- Bulk import functionality

#### 2.4 Frontend Components
- Person list with search/filter
- Person detail/edit form
- Group management interface
- Group membership manager
- Bulk import wizard

### Phase 3: Academic Control Module (Week 11-14)

#### 3.1 Database Schema
**Entities:**
- Course
- CourseInstance
- Enrollment
- Schedule
- AttendanceRecord
- Grade
- Certificate

#### 3.2 API Endpoints
**Course Management:**
- CRUD for courses
- Course template management
- Course instance creation
- Schedule management

**Enrollment Management:**
- Enrollment workflow
- Waitlist management
- Attendance tracking
- Grade recording

#### 3.3 Business Logic
- Enrollment state machine
- Automatic waitlist processing
- Certificate generation
- Prerequisites validation

#### 3.4 Frontend Components
- Course catalog
- Course instance calendar
- Enrollment management
- Attendance tracker
- Grade book

### Phase 4: Financial Module - Accounts Receivable (Week 15-18)

#### 4.1 Database Schema
**Entities:**
- Invoice
- InvoiceLineItem
- BillingProfile
- RecurringCharge
- PaymentTransaction

#### 4.2 API Endpoints
**Billing Management:**
- Billing profile CRUD
- Invoice generation
- Payment recording
- Recurring charge management

#### 4.3 Business Logic
- Billing profile precedence engine
- Automatic invoice generation
- Payment reminders
- Overdue management

#### 4.4 Frontend Components
- Billing profile manager
- Invoice list/detail
- Payment recording
- Financial reports

### Phase 5: Financial Module - Accounts Payable (Week 19-22)

#### 5.1 Database Schema
**Entities:**
- PaymentProfile
- PayableInvoice
- PayableLineItem

#### 5.2 API Endpoints
- Payment profile management
- Payable invoice generation
- Approval workflow

#### 5.3 Business Logic
- Instructor payment calculation
- Batch processing
- Tax withholding

#### 5.4 Frontend Components
- Payment profile configuration
- Payable invoice approval
- Payment reports

### Phase 6: Polish & Production (Week 23-28)

#### 6.1 Performance Optimization
- Database query optimization
- Caching strategy implementation
- Frontend bundle optimization
- API response compression

#### 6.2 Security Hardening
- Security audit
- Penetration testing
- OWASP compliance check
- Data encryption implementation

#### 6.3 Production Infrastructure
- Azure deployment scripts
- CI/CD pipeline setup
- Monitoring configuration
- Backup automation

#### 6.4 Documentation
- API documentation
- User manual
- Admin guide
- Developer documentation

## Technical Implementation Details

### API Architecture

```typescript
// Example NestJS module structure
@Module({
  imports: [
    TypeOrmModule.forFeature([Person, Group, GroupMembership]),
    AuthModule,
    TenantModule,
  ],
  controllers: [PersonController, GroupController],
  providers: [
    PersonService,
    GroupService,
    MembershipService,
    PersonRepository,
    GroupRepository,
  ],
  exports: [PersonService, GroupService],
})
export class PeopleModule {}
```

### Multi-tenant Implementation

```typescript
// Tenant-aware repository example
@Injectable()
export class TenantAwareRepository<T> {
  constructor(
    private dataSource: DataSource,
    private tenantService: TenantService,
  ) {}

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    const schema = this.tenantService.getCurrentSchema();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.query(`SET search_path TO ${schema}`);
    // Execute query
  }
}
```

### Frontend Architecture

```typescript
// Example Next.js app structure
app/
├── [locale]/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── people/
│   │   ├── courses/
│   │   └── financial/
│   └── layout.tsx
├── api/
│   └── [...path]/
└── components/
```

## Testing Strategy

### Unit Tests
- Service layer logic
- Utility functions
- Validation schemas

### Integration Tests
- API endpoints
- Database operations
- Multi-tenant scenarios

### E2E Tests
- Critical user flows
- Cross-module workflows
- Payment processing

## Deployment Strategy

### Development Environment
- Local Docker Compose
- Hot reloading
- Seed data

### Staging Environment
- Azure App Service (Basic tier)
- Azure Database for PostgreSQL (Basic)
- Manual deployment

### Production Environment
- Azure App Service (Standard tier with auto-scaling)
- Azure Database for PostgreSQL (General Purpose)
- CI/CD via GitHub Actions
- Zero-downtime deployments

## Risk Mitigation

### Technical Risks
1. **Multi-tenant complexity**: Start with simple schema isolation, optimize later
2. **Performance at scale**: Implement caching early, monitor closely
3. **Data migration**: Create robust backup/restore procedures

### Business Risks
1. **Scope creep**: Stick to MVP features, track all requests
2. **User adoption**: Early user testing, iterative improvements
3. **Payment integration**: Start with manual payments, automate gradually

## Success Criteria

### Phase Completion Metrics
- All unit tests passing (>80% coverage)
- API endpoints documented and tested
- Frontend components responsive and accessible
- No critical security vulnerabilities
- Performance benchmarks met

### MVP Launch Criteria
- Core modules functional
- 10 beta users successfully onboarded
- <2s page load time
- Zero data loss incidents
- Backup and restore tested

## Next Steps After MVP

1. **Mobile Application**: React Native app for key features
2. **Advanced Analytics**: Dashboards and reports
3. **API Public Access**: OAuth2 for third-party integrations
4. **Marketplace**: Course templates and materials
5. **AI Features**: Smart scheduling, predictive analytics

## Communication Plan

### Weekly Updates
- Progress against timeline
- Blockers and solutions
- Next week's goals

### Bi-weekly Demos
- Feature demonstrations
- User feedback sessions
- Iteration planning

### Monthly Reviews
- Overall progress
- Budget status
- Risk assessment
- Timeline adjustments

---

This implementation plan provides a clear roadmap for building PERSEO. Each phase builds upon the previous one, ensuring a stable foundation while delivering value incrementally. The plan is designed to be flexible enough to accommodate changes while maintaining focus on the core MVP features.