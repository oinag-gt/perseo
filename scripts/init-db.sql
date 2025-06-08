-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create public schema tables (for multi-tenancy)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subdomain VARCHAR(63) UNIQUE NOT NULL,
    schema_name VARCHAR(63) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    logo_url VARCHAR(500),
    user_limit INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create audit log table in public schema
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_is_active ON tenants(is_active);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create default tenant
INSERT INTO tenants (subdomain, schema_name, name, description) 
VALUES ('demo', 'tenant_demo', 'Demo Organization', 'Demo tenant for testing')
ON CONFLICT (subdomain) DO NOTHING;

-- Create demo tenant schema
CREATE SCHEMA IF NOT EXISTS tenant_demo;

-- Function to create tenant schema with all required tables
CREATE OR REPLACE FUNCTION create_tenant_schema(schema_name TEXT)
RETURNS void AS $$
BEGIN
    -- Create schema
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
    
    -- Set search path
    EXECUTE format('SET search_path TO %I', schema_name);
    
    -- Create users table
    EXECUTE 'CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        is_email_verified BOOLEAN DEFAULT false,
        email_verification_token VARCHAR(255),
        email_verification_expires TIMESTAMP,
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP,
        roles TEXT[] DEFAULT ARRAY[''member''],
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        last_login_at TIMESTAMP,
        last_login_ip INET,
        tenant_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
    )';
    
    -- Create refresh tokens table
    EXECUTE 'CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        token VARCHAR(500) UNIQUE NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        is_revoked BOOLEAN DEFAULT false,
        user_agent TEXT,
        ip_address INET,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
    )';
    
    -- Create indexes
    EXECUTE 'CREATE INDEX idx_users_email ON users(email)';
    EXECUTE 'CREATE INDEX idx_users_tenant_id ON users(tenant_id)';
    EXECUTE 'CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token)';
    EXECUTE 'CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id)';
    
    -- Reset search path
    SET search_path TO public;
END;
$$ LANGUAGE plpgsql;

-- Create demo tenant schema with tables
SELECT create_tenant_schema('tenant_demo');