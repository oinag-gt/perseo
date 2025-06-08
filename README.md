# PERSEO - Platform for Educational Resources, Services, Enrollment & Operations

## Overview

PERSEO is a comprehensive educational management platform designed to streamline operations for educational institutions. It provides modules for people management, academic control, and financial operations with multi-tenant support.

## Project Structure

This is a monorepo project using npm workspaces and Turborepo:

```
perseo/
├── packages/
│   ├── api/          # NestJS backend API
│   ├── web/          # Next.js 14 frontend
│   └── shared/       # Shared types and utilities
├── scripts/          # Database initialization scripts
├── docker-compose.yml
└── turbo.json
```

## Prerequisites

- Node.js 20 LTS
- Docker and Docker Compose
- PostgreSQL 15+ (if running locally)
- Redis (if running locally)

## Quick Start

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp packages/api/.env.example packages/api/.env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development environment with Docker:
   ```bash
   docker-compose up -d
   ```

5. Run database migrations (first time only):
   ```bash
   npm run migrate --workspace=@perseo/api
   ```

6. Start the development servers:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

## Development

### Available Scripts

- `npm run dev` - Start all packages in development mode
- `npm run build` - Build all packages
- `npm run test` - Run tests
- `npm run lint` - Run linting
- `npm run typecheck` - Run TypeScript type checking

### Working with specific packages

```bash
# Run commands for specific workspaces
npm run dev --workspace=@perseo/api
npm run dev --workspace=@perseo/web
npm run build --workspace=@perseo/shared
```

## Architecture

- **Multi-tenant**: Schema-based isolation with PostgreSQL
- **Authentication**: JWT with refresh tokens
- **API**: RESTful API with Swagger documentation
- **Frontend**: Server-side rendering with Next.js 14
- **Background Jobs**: Redis + Bull for queue management
- **Type Safety**: Shared TypeScript types across packages

## Phase 0 Implementation Status

✅ Monorepo structure with npm workspaces and Turborepo
✅ Backend foundation with NestJS, TypeORM, and Bull
✅ Frontend foundation with Next.js 14, Tailwind CSS, and Radix UI
✅ Shared package for types and utilities
✅ Docker Compose for local development
✅ Multi-tenant architecture with schema isolation
✅ Authentication system with JWT and refresh tokens

## Next Steps

Phase 1 will focus on completing the authentication system and implementing the People module. See `PERSEO-implementation-plan.md` for detailed roadmap.