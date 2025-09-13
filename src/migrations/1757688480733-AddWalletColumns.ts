import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsersWalletColumns1757688480733 implements MigrationInterface {
    name = 'UpdateUsersWalletColumns1757688480733'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // connectedWallet 제거
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN IF EXISTS \`connectedWallet\``);

        // tempWallet 컬럼과 인덱스 추가 (nullable 유지)
        await queryRunner.query(`ALTER TABLE \`users\` ADD COLUMN IF NOT EXISTS \`tempWallet\` varchar(255) NULL`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS \`idx_users_temp_wallet\` ON \`users\` (\`tempWallet\`)`);

        // isFirstChargeCompleted 컬럼 추가
        await queryRunner.query(`ALTER TABLE \`users\` ADD COLUMN IF NOT EXISTS \`isFirstChargeCompleted\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 롤백: isFirstChargeCompleted 삭제
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN IF EXISTS \`isFirstChargeCompleted\``);

        // tempWallet 삭제 및 인덱스 제거
        await queryRunner.query(`DROP INDEX IF EXISTS \`idx_users_temp_wallet\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN IF EXISTS \`tempWallet\``);

        // connectedWallet 컬럼 복원
        await queryRunner.query(`ALTER TABLE \`users\` ADD COLUMN IF NOT EXISTS \`connectedWallet\` varchar(255) NULL`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS \`idx_users_connected_wallet\` ON \`users\` (\`connectedWallet\`)`);
    }
}
