import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWalletColumns1757688480733 implements MigrationInterface {
    name = 'AddWalletColumns1757688480733'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`connectedWallet\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`tempWallet\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isFirstChargeCompleted\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`CREATE INDEX \`idx_users_connected_wallet\` ON \`users\` (\`connectedWallet\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_users_temp_wallet\` ON \`users\` (\`tempWallet\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`idx_users_temp_wallet\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`idx_users_connected_wallet\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isFirstChargeCompleted\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`tempWallet\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`connectedWallet\``);
    }

}
