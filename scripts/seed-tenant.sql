-- Insert demo tenant if it doesn't exist
INSERT INTO tenants (
  id,
  subdomain,
  "schemaName",
  name,
  description,
  "isActive",
  "userLimit",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'demo',
  'public',
  'Demo Organization',
  'Default demo tenant for development',
  true,
  100,
  NOW(),
  NOW()
) ON CONFLICT (subdomain) DO NOTHING;