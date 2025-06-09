# PERSEO - Claude AI Development Configuration

## Project Overview

PERSEO is a comprehensive educational management platform with multi-tenant support, built using a modern TypeScript monorepo architecture.

**Architecture**: Multi-tenant SaaS platform with schema-based isolation
**Tech Stack**: NestJS + Next.js 15 + PostgreSQL + Redis + TypeScript
**Project Type**: Educational Management System (ERP for Education)

## Project Structure

```
perseo/
├── packages/
│   ├── api/          # NestJS backend API (Port 3001)
│   ├── web/          # Next.js 15 frontend (Port 3000)
│   └── shared/       # Shared TypeScript types and utilities
├── scripts/          # Database initialization and utility scripts
├── .env.local        # Environment variables (root level)
├── docker-compose.yml
└── turbo.json        # Turborepo configuration
```

## Development Environment

### Required Services
- **PostgreSQL 15+**: Primary database with multi-tenant schemas
- **Redis**: Session storage and background job queue (Bull)
- **SMTP**: Email delivery (Office 365/Outlook configured)

### Environment Setup
- **Node.js**: 20 LTS required
- **Package Manager**: npm workspaces + Turborepo
- **Environment File**: `.env.local` in project root (loads for API)
- **Docker**: PostgreSQL + Redis services via docker-compose

### Key Commands
```bash
# Development (start all services)
npm run dev

# Build all packages
npm run build

# Test all packages
npm run test

# Package-specific commands
npm run dev --workspace=@perseo/api
npm run build --workspace=@perseo/web
npm test --workspace=@perseo/api

# Database operations
npm run migration:run --workspace=@perseo/api
npm run migration:generate --workspace=@perseo/api
```

## Current Implementation Status

### ✅ Completed Features

**Phase 0 - Foundation:**
- [x] Monorepo setup with npm workspaces and Turborepo
- [x] NestJS API with TypeORM, PostgreSQL, Redis/Bull
- [x] Next.js 15 frontend with Tailwind CSS and TypeScript
- [x] Docker Compose development environment
- [x] Multi-tenant architecture with schema isolation
- [x] Shared TypeScript packages

**Authentication System (Phase 1):**
- [x] JWT authentication with access and refresh tokens
- [x] User registration with email verification
- [x] Password reset functionality
- [x] Login/logout with proper session management
- [x] Protected routes and middleware
- [x] Multi-tenant user isolation
- [x] Comprehensive unit tests (AuthService: 7/7 passing)
- [x] Frontend authentication pages and context
- [x] Email service with SMTP configuration

### 🔧 Current Technical Setup

**Backend (API - NestJS):**
- **Authentication**: JWT strategy with Passport.js
- **Database**: TypeORM with PostgreSQL, schema-per-tenant
- **Email**: Nodemailer with Office 365 SMTP
- **Background Jobs**: Bull + Redis for async processing
- **Testing**: Jest with proper mocking
- **Documentation**: Swagger/OpenAPI at `/api/docs`

**Frontend (Web - Next.js 15):**
- **Routing**: App Router with server-side rendering
- **Styling**: Tailwind CSS with responsive design
- **State Management**: React Context for authentication
- **Forms**: Controlled components with validation
- **TypeScript**: Strict mode with shared types

**Database Schema:**
- **Multi-tenancy**: Schema-based isolation
- **Users**: Full authentication fields (email verification, password reset, account locking)
- **Refresh Tokens**: Secure token management with expiration
- **Audit Logs**: User activity tracking per tenant

## Development Guidelines

### Code Standards
- **TypeScript**: Strict mode, no `any` types
- **Error Handling**: Proper error types, no silent failures
- **Testing**: Unit tests required for services and critical functions
- **Security**: No secrets in code, environment variables for configuration

### Authentication Flow
1. **Registration**: User creates account → Email verification sent → Account activated
2. **Login**: Credentials validated → JWT tokens issued → User authenticated
3. **Token Refresh**: Access token expires → Refresh token used → New tokens issued
4. **Protected Routes**: JWT verified → User data populated → Access granted

### Multi-tenant Architecture
- **Schema Isolation**: Each tenant gets dedicated database schema
- **Middleware**: Tenant context populated from subdomain/headers
- **Data Access**: All queries automatically scoped to tenant schema
- **User Isolation**: Users belong to specific tenants, no cross-tenant access

## Common Development Tasks

### Authentication Testing
```bash
# Test registration
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Test login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test email connection
curl -X POST http://localhost:3001/api/v1/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@domain.com"}'
```

### Database Operations
```bash
# Run migrations
npm run migration:run --workspace=@perseo/api

# Generate new migration
npm run migration:generate --workspace=@perseo/api -- src/migrations/MigrationName

# Seed initial tenant data
psql -h localhost -U postgres -d perseo -f scripts/seed-tenant.sql
```

### Build and Deploy
```bash
# Full build (all packages)
npm run build

# API only
npm run build --workspace=@perseo/api

# Test production build
npm run start --workspace=@perseo/api
```

## Known Issues & Solutions

### Email Configuration
- **Issue**: SMTP connection failures with Office 365
- **Solution**: Use `smtp-mail.outlook.com` host, ensure app passwords for 2FA accounts
- **Test**: Use `/api/v1/auth/test-email` endpoint for debugging

### Build Errors
- **Issue**: ESLint errors during Next.js build
- **Solution**: Fix TypeScript types, add Suspense boundaries for useSearchParams()
- **Prevention**: Run `npm run lint` before commits

### Security Vulnerabilities
- **Status**: Most critical vulnerabilities resolved via npm audit fix
- **Remaining**: 3 high-severity in multer/NestJS (non-critical for functionality)
- **Monitoring**: Regular `npm audit` checks recommended

## Branch Naming Conventions

**MANDATORY**: All branches must follow these naming patterns:

### **Branch Types**
- `feature/` - New features or enhancements
- `fix/` - Bug fixes  
- `docs/` - Documentation changes
- `refactor/` - Code refactoring without feature changes
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks, dependency updates
- `hotfix/` - Critical production fixes (branch from main)

### **Naming Format**
```
<type>/<scope>-<description>
```

**Examples:**
- `feature/auth-email-verification`
- `fix/login-session-timeout`
- `docs/api-endpoint-documentation`
- `refactor/user-service-cleanup`
- `test/auth-integration-tests`
- `chore/update-dependencies`
- `hotfix/security-vulnerability-fix`

### **Rules:**
- Use lowercase letters and hyphens only
- No spaces, underscores, or special characters
- Keep descriptions concise but descriptive
- Include scope when working on specific modules (auth, api, web, etc.)

### **Protected Branches**
- `main` - Production releases only
- `develop` - Development integration branch. This should be the default branch when creating Pull Requests. 

**NEVER commit directly to protected branches - always use Pull Requests**

## Commit Message Conventions

**MANDATORY**: All commits must follow Conventional Commits format:

### **Format**
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### **Types**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance, dependencies, build tools
- `ci` - CI/CD changes
- `perf` - Performance improvements
- `revert` - Revert previous commit

### **Scopes** (for PERSEO project)
- `auth` - Authentication system
- `api` - Backend API changes
- `web` - Frontend/web changes
- `db` - Database changes
- `email` - Email service
- `config` - Configuration changes
- `deps` - Dependencies

### **Examples**
```bash
feat(auth): add email verification for new users
fix(api): resolve user session timeout issue
docs(readme): update installation instructions
refactor(auth): simplify JWT token validation
test(api): add integration tests for user endpoints
chore(deps): update NestJS to v11
```

### **Rules**
- Use lowercase for type and scope
- Keep description under 72 characters
- Use imperative mood ("add" not "added")
- Include scope when applicable
- Add body for complex changes
- Reference issues/PRs in footer when relevant
- Don't use Co-Authored addition unless user ask for it

### **Git Configuration**
A commit message template is provided in `.gitmessage`. Configure it with:
```bash
git config commit.template .gitmessage
```

## Git Workflow

### **Feature Development:**
```bash
# Always start from develop
git checkout develop
git pull origin develop

# Create feature branch with proper naming
git checkout -b feature/auth-password-reset

# Work on feature, commit changes
git add .
git commit -m "feat(auth): add password reset functionality"

# Push and create PR
git push -u origin feature/auth-password-reset
gh pr create --base develop --title "feat(auth): Add password reset functionality"
```

### **Hotfix Process:**
```bash
# Branch from main for critical fixes
git checkout main
git pull origin main
git checkout -b hotfix/security-patch-auth

# Fix, commit, and create PR to main
git commit -m "fix(auth): patch security vulnerability CVE-2024-xxxxx"
git push -u origin hotfix/security-patch-auth
gh pr create --base main --title "hotfix(auth): Security patch for authentication"
```

## Development Workflow

1. **Start Services**: `docker-compose up -d` (PostgreSQL + Redis)
2. **Install Dependencies**: `npm install`
3. **Environment Setup**: Ensure `.env.local` is properly configured
4. **Database Migration**: `npm run migration:run --workspace=@perseo/api`
5. **Create Feature Branch**: Follow naming conventions above
6. **Start Development**: `npm run dev`
7. **Testing**: Access frontend at http://localhost:3000, API at http://localhost:3001
8. **Create PR**: Use proper titles and descriptions

## Future Roadmap

**Phase 2 - People Module:**
- User management and profiles
- Role-based access control (RBAC)
- Student and instructor management

**Phase 3 - Academic Module:**
- Course and curriculum management
- Enrollment and attendance tracking
- Grading and assessment system

**Phase 4 - Financial Module:**
- Billing and invoicing
- Payment processing
- Financial reporting

## Technical Decisions

### Why These Technologies?
- **NestJS**: Enterprise-grade Node.js framework with TypeScript support
- **Next.js 15**: Modern React framework with excellent SSR and app routing
- **PostgreSQL**: Robust RDBMS with excellent multi-tenancy support
- **TypeORM**: Type-safe database operations with migration support
- **Turborepo**: Efficient monorepo management with intelligent caching

### Multi-tenancy Approach
- **Schema-based isolation**: Better data isolation and performance than row-level
- **Tenant middleware**: Automatic context setting from request headers
- **Shared infrastructure**: Cost-effective while maintaining security

This configuration file should help Claude understand the project structure, current status, and how to work effectively with the PERSEO codebase.