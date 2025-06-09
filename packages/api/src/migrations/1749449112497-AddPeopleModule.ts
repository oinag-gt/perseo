import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPeopleModule1749449112497 implements MigrationInterface {
    name = 'AddPeopleModule1749449112497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."persons_nationalidtype_enum" AS ENUM('DNI', 'PASSPORT', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."persons_gender_enum" AS ENUM('M', 'F', 'OTHER', 'PREFER_NOT_TO_SAY')`);
        await queryRunner.query(`CREATE TYPE "public"."persons_preferredlanguage_enum" AS ENUM('es', 'en')`);
        await queryRunner.query(`CREATE TABLE "persons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "alternateEmails" text, "phone" character varying NOT NULL, "alternatePhones" text, "birthDate" date NOT NULL, "nationalId" character varying NOT NULL, "nationalIdType" "public"."persons_nationalidtype_enum" NOT NULL DEFAULT 'DNI', "gender" "public"."persons_gender_enum", "address" jsonb NOT NULL, "emergencyContact" jsonb NOT NULL, "preferredLanguage" "public"."persons_preferredlanguage_enum" NOT NULL DEFAULT 'es', "communicationPreferences" jsonb NOT NULL, "photoUrl" character varying, "notes" text, "tags" text, "tenantId" uuid NOT NULL, CONSTRAINT "UQ_928155276ca8852f3c440cc2b2c" UNIQUE ("email"), CONSTRAINT "UQ_2bcdceb78713e1b1cfc7aa2ba4d" UNIQUE ("nationalId"), CONSTRAINT "PK_74278d8812a049233ce41440ac7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_928155276ca8852f3c440cc2b2" ON "persons" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_2bcdceb78713e1b1cfc7aa2ba4" ON "persons" ("nationalId") `);
        await queryRunner.query(`CREATE INDEX "IDX_35e20e2072834469e689c2c1ad" ON "persons" ("tenantId") `);
        await queryRunner.query(`CREATE TYPE "public"."groups_type_enum" AS ENUM('ADMINISTRATIVE', 'ACADEMIC', 'SOCIAL', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "description" text, "type" "public"."groups_type_enum" NOT NULL DEFAULT 'OTHER', "parentGroupId" uuid, "leaderId" uuid, "maxMembers" integer, "isActive" boolean NOT NULL DEFAULT true, "metadata" jsonb, "tenantId" uuid NOT NULL, CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_df0d0b85eee65b9064b8e21a83" ON "groups" ("parentGroupId") `);
        await queryRunner.query(`CREATE INDEX "IDX_24fc38b81b44b41ea1c9d0719a" ON "groups" ("leaderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ca257df4814415f02a6799bce4" ON "groups" ("tenantId") `);
        await queryRunner.query(`CREATE TYPE "public"."group_memberships_role_enum" AS ENUM('MEMBER', 'LEADER', 'COORDINATOR')`);
        await queryRunner.query(`CREATE TYPE "public"."group_memberships_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED')`);
        await queryRunner.query(`CREATE TABLE "group_memberships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "personId" uuid NOT NULL, "groupId" uuid NOT NULL, "role" "public"."group_memberships_role_enum" NOT NULL DEFAULT 'MEMBER', "startDate" date NOT NULL, "endDate" date, "status" "public"."group_memberships_status_enum" NOT NULL DEFAULT 'ACTIVE', "reason" text, "addedBy" uuid NOT NULL, CONSTRAINT "UQ_785780ad0ad68f59f86ca2c3c2a" UNIQUE ("personId", "groupId", "startDate"), CONSTRAINT "PK_4a04ebe9f25ad41f45b2c0ca4b5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_34f101fd4d1be2c39b5ff3af8b" ON "group_memberships" ("personId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a434c0d46f4b97696924ecdd17" ON "group_memberships" ("groupId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c686c01d0410b159a35126f02a" ON "group_memberships" ("addedBy") `);
        await queryRunner.query(`CREATE TYPE "public"."documents_type_enum" AS ENUM('IDENTIFICATION', 'PROOF_OF_ADDRESS', 'ACADEMIC_CERTIFICATE', 'MEDICAL_CERTIFICATE', 'EMERGENCY_CONTACT_INFO', 'PHOTO', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "type" "public"."documents_type_enum" NOT NULL DEFAULT 'OTHER', "url" character varying NOT NULL, "fileName" character varying NOT NULL, "mimeType" character varying NOT NULL, "fileSize" integer NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "personId" uuid NOT NULL, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_303be07b15d20ab10ab0c72200" ON "documents" ("personId") `);
        await queryRunner.query(`ALTER TABLE "persons" ADD CONSTRAINT "FK_35e20e2072834469e689c2c1ade" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_df0d0b85eee65b9064b8e21a837" FOREIGN KEY ("parentGroupId") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_24fc38b81b44b41ea1c9d0719a8" FOREIGN KEY ("leaderId") REFERENCES "persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_ca257df4814415f02a6799bce41" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_memberships" ADD CONSTRAINT "FK_34f101fd4d1be2c39b5ff3af8bb" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_memberships" ADD CONSTRAINT "FK_a434c0d46f4b97696924ecdd176" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_memberships" ADD CONSTRAINT "FK_c686c01d0410b159a35126f02ac" FOREIGN KEY ("addedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_303be07b15d20ab10ab0c722007" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_303be07b15d20ab10ab0c722007"`);
        await queryRunner.query(`ALTER TABLE "group_memberships" DROP CONSTRAINT "FK_c686c01d0410b159a35126f02ac"`);
        await queryRunner.query(`ALTER TABLE "group_memberships" DROP CONSTRAINT "FK_a434c0d46f4b97696924ecdd176"`);
        await queryRunner.query(`ALTER TABLE "group_memberships" DROP CONSTRAINT "FK_34f101fd4d1be2c39b5ff3af8bb"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_ca257df4814415f02a6799bce41"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_24fc38b81b44b41ea1c9d0719a8"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_df0d0b85eee65b9064b8e21a837"`);
        await queryRunner.query(`ALTER TABLE "persons" DROP CONSTRAINT "FK_35e20e2072834469e689c2c1ade"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_303be07b15d20ab10ab0c72200"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TYPE "public"."documents_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c686c01d0410b159a35126f02a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a434c0d46f4b97696924ecdd17"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_34f101fd4d1be2c39b5ff3af8b"`);
        await queryRunner.query(`DROP TABLE "group_memberships"`);
        await queryRunner.query(`DROP TYPE "public"."group_memberships_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."group_memberships_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ca257df4814415f02a6799bce4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_24fc38b81b44b41ea1c9d0719a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df0d0b85eee65b9064b8e21a83"`);
        await queryRunner.query(`DROP TABLE "groups"`);
        await queryRunner.query(`DROP TYPE "public"."groups_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_35e20e2072834469e689c2c1ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2bcdceb78713e1b1cfc7aa2ba4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_928155276ca8852f3c440cc2b2"`);
        await queryRunner.query(`DROP TABLE "persons"`);
        await queryRunner.query(`DROP TYPE "public"."persons_preferredlanguage_enum"`);
        await queryRunner.query(`DROP TYPE "public"."persons_gender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."persons_nationalidtype_enum"`);
    }

}
