import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1704800000000 implements MigrationInterface {
  name = 'InitialSchema1704800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Create tenants table
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "subdomain" character varying NOT NULL,
        "schemaName" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "settings" jsonb,
        "contactEmail" character varying,
        "contactPhone" character varying,
        "address" character varying,
        "logoUrl" character varying,
        "userLimit" integer NOT NULL DEFAULT '0',
        "expiresAt" TIMESTAMP,
        CONSTRAINT "UQ_tenants_subdomain" UNIQUE ("subdomain"),
        CONSTRAINT "UQ_tenants_schemaName" UNIQUE ("schemaName"),
        CONSTRAINT "PK_tenants" PRIMARY KEY ("id")
      )
    `);
    
    // Create indexes for tenants
    await queryRunner.query(`CREATE INDEX "IDX_tenants_subdomain" ON "tenants" ("subdomain")`);
    await queryRunner.query(`CREATE INDEX "IDX_tenants_isActive" ON "tenants" ("isActive")`);
    
    // Create users_roles_enum
    await queryRunner.query(`CREATE TYPE "public"."users_roles_enum" AS ENUM('super_admin', 'tenant_admin', 'instructor', 'student', 'member')`);
    
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "emailVerificationToken" character varying,
        "emailVerificationExpires" TIMESTAMP,
        "passwordResetToken" character varying,
        "passwordResetExpires" TIMESTAMP,
        "roles" "public"."users_roles_enum" array NOT NULL DEFAULT '{member}',
        "failedLoginAttempts" integer NOT NULL DEFAULT '0',
        "lockedUntil" TIMESTAMP,
        "lastLoginAt" TIMESTAMP,
        "lastLoginIp" character varying,
        "tenantId" uuid,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    
    // Create indexes for users
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_tenantId" ON "users" ("tenantId")`);
    
    // Create refresh_tokens table
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "token" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "isRevoked" boolean NOT NULL DEFAULT false,
        "userAgent" character varying,
        "ipAddress" character varying,
        "userId" uuid,
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
      )
    `);
    
    // Create indexes for refresh_tokens
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")`);
    
    // Create audit_logs table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid,
        "userId" uuid,
        "action" character varying(100) NOT NULL,
        "entityType" character varying(100),
        "entityId" uuid,
        "oldValues" jsonb,
        "newValues" jsonb,
        "ipAddress" inet,
        "userAgent" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);
    
    // Create indexes for audit_logs
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_tenantId" ON "audit_logs" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_userId" ON "audit_logs" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_createdAt" ON "audit_logs" ("createdAt")`);
    
    // Add foreign keys
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_tenantId" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_refresh_tokens_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_logs_tenantId" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_logs_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    
    // Create function for updating updatedAt timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW."updatedAt" = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // Create triggers for updatedAt
    await queryRunner.query(`CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON "tenants" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()`);
    await queryRunner.query(`CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()`);
    await queryRunner.query(`CREATE TRIGGER update_refresh_tokens_updated_at BEFORE UPDATE ON "refresh_tokens" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_refresh_tokens_updated_at ON "refresh_tokens"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON "users"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_tenants_updated_at ON "tenants"`);
    
    // Drop function
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);
    
    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_logs_userId"`);
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_logs_tenantId"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_userId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_tenantId"`);
    
    // Drop indexes
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_createdAt"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_tenantId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_token"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_tenantId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tenants_isActive"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tenants_subdomain"`);
    
    // Drop tables
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
    
    // Drop enum
    await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
  }
}