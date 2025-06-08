import { Module, Global } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantMiddleware } from './tenant.middleware';

@Global()
@Module({
  providers: [TenantService],
  exports: [TenantService],
})
export class DatabaseModule {}