import { Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import { Request } from 'express';

export interface TenantInfo {
  id: string;
  schema: string;
  name: string;
}

@Injectable({ scope: Scope.REQUEST })
export class TenantService {
  private tenant: TenantInfo | null = null;

  constructor(@Inject(REQUEST) _request: Request) {}

  setTenant(tenant: TenantInfo): void {
    this.tenant = tenant;
  }

  getTenant(): TenantInfo | null {
    return this.tenant;
  }

  getCurrentSchema(): string {
    return this.tenant?.schema || 'public';
  }

  getCurrentTenantId(): string {
    if (!this.tenant?.id) {
      // For development: return a default tenant ID (UUID format)
      return '00000000-0000-0000-0000-000000000001';
    }
    return this.tenant.id;
  }

  getTenantFromRequest(request: Request): string | null {
    const hostname = request.hostname;
    const subdomain = hostname.split('.')[0];
    
    if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
      return subdomain;
    }

    const tenantHeader = request.headers['x-tenant-id'] as string;
    if (tenantHeader) {
      return tenantHeader;
    }

    return null;
  }
}