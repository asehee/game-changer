import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchemaVarchar1757513965895 implements MigrationInterface {
    name = 'InitialSchemaVarchar1757513965895'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`assets\` (\`id\` varchar(36) NOT NULL, \`gameId\` varchar(255) NOT NULL, \`path\` varchar(500) NOT NULL, \`etag\` varchar(255) NULL, \`size\` bigint NOT NULL, \`mime\` varchar(100) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`idx_assets_game_path\` (\`gameId\`, \`path\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`games\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`version\` varchar(50) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`developerAddress\` varchar(255) NULL, INDEX \`idx_games_title\` (\`title\`), INDEX \`idx_games_is_active\` (\`isActive\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`play_sessions\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NOT NULL, \`gameId\` varchar(255) NOT NULL, \`status\` enum ('ACTIVE', 'ENDED', 'REVOKED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE', \`expiresAt\` datetime NOT NULL, \`lastHeartbeatAt\` datetime NULL, \`tokenRenewalCount\` int NOT NULL DEFAULT '0', \`billingStatus\` enum ('OK', 'STOPPED', 'INSUFFICIENT', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`idx_play_sessions_status\` (\`status\`), INDEX \`idx_play_sessions_status_expires\` (\`status\`, \`expiresAt\`), INDEX \`idx_play_sessions_user_game\` (\`userId\`, \`gameId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`assets\` ADD CONSTRAINT \`FK_86046058ae1cdecc40ceaec7e95\` FOREIGN KEY (\`gameId\`) REFERENCES \`games\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`play_sessions\` ADD CONSTRAINT \`FK_ae67abfabbe1a3affd1e8cc0555\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`play_sessions\` ADD CONSTRAINT \`FK_9dbe261145056de75781f90fe16\` FOREIGN KEY (\`gameId\`) REFERENCES \`games\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`play_sessions\` DROP FOREIGN KEY \`FK_9dbe261145056de75781f90fe16\``);
        await queryRunner.query(`ALTER TABLE \`play_sessions\` DROP FOREIGN KEY \`FK_ae67abfabbe1a3affd1e8cc0555\``);
        await queryRunner.query(`ALTER TABLE \`assets\` DROP FOREIGN KEY \`FK_86046058ae1cdecc40ceaec7e95\``);
        await queryRunner.query(`DROP INDEX \`idx_play_sessions_user_game\` ON \`play_sessions\``);
        await queryRunner.query(`DROP INDEX \`idx_play_sessions_status_expires\` ON \`play_sessions\``);
        await queryRunner.query(`DROP INDEX \`idx_play_sessions_status\` ON \`play_sessions\``);
        await queryRunner.query(`DROP TABLE \`play_sessions\``);
        await queryRunner.query(`DROP INDEX \`idx_games_is_active\` ON \`games\``);
        await queryRunner.query(`DROP INDEX \`idx_games_title\` ON \`games\``);
        await queryRunner.query(`DROP TABLE \`games\``);
        await queryRunner.query(`DROP INDEX \`idx_assets_game_path\` ON \`assets\``);
        await queryRunner.query(`DROP TABLE \`assets\``);
    }
}
