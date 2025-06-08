import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantService: TenantService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = this.tenantService.getTenantFromRequest(req);
    
    if (!tenantId) {
      return next();
    }

    try {
      const result = await this.dataSource.query(
        'SELECT id, schema_name, name FROM tenants WHERE subdomain = $1 AND is_active = true',
        [tenantId],
      );

      if (result.length === 0) {
        throw new NotFoundException('Tenant not found');
      }

      const tenant = result[0];
      this.tenantService.setTenant({
        id: tenant.id,
        schema: tenant.schema_name,
        name: tenant.name,
      });

      await this.dataSource.query(`SET search_path TO ${tenant.schema_name}, public`);
    } catch (error) {
      console.error('Tenant resolution error:', error);
    }

    next();
  }
}