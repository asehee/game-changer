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
    const developerId = "92f32007-1d11-44ca-bb24-c40e9c040a28"
    const developerWallet = 'rK9Y8cmvTHBisfG7Wik9UwBZdEne4yKBq6';
    console.log(`Upserting developer: ${developerWallet}`);
    await dataSource.query(`
      INSERT INTO users (id, wallet, status, isDeveloper, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE updatedAt = NOW();
    `, [
        developerId, 
        developerWallet, 
        'ACTIVE',
        true
    ]);

    const gameId = "3caf36a4-828a-4ef1-8c09-8129ec286940";
    const thumbnail = '/assets/game_images/puzzle1.png';
    const gameUrl = 'http://localhost:3000/games/2048-master/index.html';
    console.log(`Upserting demogame`);
    await dataSource.query(`
      INSERT INTO games (id, developerId, title, version, description, thumbnail, gameUrl, approvalStatus, ratePerSession, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        title = VALUES(title);
    `, [
        gameId, 
        developerId, 
        'puzzle 2048',
        '1.0',
        'Fun puzzle game, make 2048!', 
        thumbnail, 
        gameUrl, 
        'APPROVED', 
        1.0
    ]);
  
    console.log('\nSeed data created successfully!');
    console.log('\nTest credentials:');
    console.log(`User ID: ${developerId}`);
    console.log(`Game ID: ${gameId}`);
    console.log(`\nYou can use these IDs to test the API endpoints.`);
    
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();