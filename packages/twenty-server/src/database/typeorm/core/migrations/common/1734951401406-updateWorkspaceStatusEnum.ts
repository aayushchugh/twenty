import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWorkspaceStatusEnum1734951401406
  implements MigrationInterface
{
  name = 'UpdateWorkspaceStatusEnum1734951401406';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."workspace_activationstatus_enum" RENAME TO "workspace_activationStatus_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."workspace_activationStatus_enum" AS ENUM('ONGOING_CREATION', 'PENDING_CREATION', 'ACTIVE', 'INACTIVE', 'SUSPENDED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" TYPE "core"."workspace_activationStatus_enum" USING "activationStatus"::"text"::"core"."workspace_activationStatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" SET DEFAULT 'PENDING_CREATION'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspace_activationStatus_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."workspace_activationStatus_enum_old" AS ENUM('ONGOING_CREATION', 'PENDING_CREATION', 'ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" TYPE "core"."workspace_activationStatus_enum_old" USING "activationStatus"::"text"::"core"."workspace_activationStatus_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" SET DEFAULT 'INACTIVE'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspace_activationStatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."workspace_activationStatus_enum_old" RENAME TO "workspace_activationstatus_enum"`,
    );
  }
}
