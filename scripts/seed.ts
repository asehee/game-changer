import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../src/config/database.config';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('Database connected');

    // Create test user
    const userId = uuidv4();
    await dataSource.query(`
      INSERT INTO users (id, wallet, status, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (wallet) DO UPDATE SET updated_at = NOW()
      RETURNING id
    `, [userId, 'test-wallet-001', 'ACTIVE']);
    console.log(`Created user: ${userId}`);

    // Create test game
    const gameId = uuidv4();
    await dataSource.query(`
      INSERT INTO games (id, title, version, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [gameId, 'Sample Phaser Game', '1.0.0', true]);
    console.log(`Created game: ${gameId}`);

    // Create test asset
    const assetId = uuidv4();
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
    
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();