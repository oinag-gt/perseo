export interface Tenant {
  id: string;
  subdomain: string;
  schemaName: string;
  name: string;
  description?: string;
  isActive: boolean;
  settings?: Record<string, any>;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  logoUrl?: string;
  userLimit: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}