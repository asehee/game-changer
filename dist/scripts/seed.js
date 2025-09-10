"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const database_config_1 = require("../src/config/database.config");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function seed() {
    const dataSource = new typeorm_1.DataSource(database_config_1.dataSourceOptions);
    try {
        await dataSource.initialize();
        console.log('Database connected');
        const userId = (0, uuid_1.v4)();
        await dataSource.query(`
      INSERT INTO users (id, wallet, status, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (wallet) DO UPDATE SET updated_at = NOW()
      RETURNING id
    `, [userId, 'test-wallet-001', 'ACTIVE']);
        console.log(`Created user: ${userId}`);
        const gameId = (0, uuid_1.v4)();
        await dataSource.query(`
      INSERT INTO games (id, title, version, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [gameId, 'Sample Phaser Game', '1.0.0', true]);
        console.log(`Created game: ${gameId}`);
        const assetId = (0, uuid_1.v4)();
        const assetPath = 'sample-game.js';
        const fullPath = path.join(__dirname, '..', 'storage', 'assets', assetPath);
        const stats = fs.statSync(fullPath);
        await dataSource.query(`
      INSERT INTO assets (id, game_id, path, size, mime, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT DO NOTHING
    `, [assetId, gameId, assetPath, stats.size.toString(), 'application/javascript']);
        console.log(`Created asset: ${assetId}`);
        console.log('\nSeed data created successfully!');
        console.log('\nTest credentials:');
        console.log(`User ID: ${userId}`);
        console.log(`Game ID: ${gameId}`);
        console.log(`Asset ID: ${assetId}`);
        console.log(`\nYou can use these IDs to test the API endpoints.`);
    }
    catch (error) {
        console.error('Seed failed:', error);
    }
    finally {
        await dataSource.destroy();
    }
}
seed();
//# sourceMappingURL=seed.js.map