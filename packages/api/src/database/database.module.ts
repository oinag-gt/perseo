import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';
import { AuditLog } from './entities/audit-log.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tenant, AuditLog])],
  providers: [TenantService],
  exports: [TenantService, TypeOrmModule],
})
export class DatabaseModule {}