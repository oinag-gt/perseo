import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialTenant1704800001000 implements MigrationInterface {
  name = 'SeedInitialTenant1704800001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert default tenant
    await queryRunner.query(`
      INSERT INTO "tenants" (
        "id",
        "subdomain",
        "schemaName",
        "name",
        "description",
        "isActive",
        "userLimit"
      ) VALUES (
        uuid_generate_v4(),
        'demo',
        'public',
        'Demo Organization',
        'Default demo tenant for development',
        true,
        100
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "tenants" WHERE "subdomain" = 'demo'`);
  }
}