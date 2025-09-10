import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

describe('Play Session E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testUserId: string;
  let testGameId: string;
  let sessionToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    await app.init();
    dataSource = app.get(DataSource);

    testUserId = uuidv4();
    testGameId = uuidv4();

    await dataSource.query(`
      INSERT INTO users (id, wallet, status, created_at, updated_at)
      VALUES ($1, $2, 'ACTIVE', NOW(), NOW())
    `, [testUserId, `wallet_${testUserId}`]);

    await dataSource.query(`
      INSERT INTO games (id, title, version, is_active, created_at, updated_at)
      VALUES ($1, 'Test Game', '1.0.0', true, NOW(), NOW())
    `, [testGameId]);
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.query('DELETE FROM play_sessions WHERE user_id = $1', [testUserId]);
      await dataSource.query('DELETE FROM users WHERE id = $1', [testUserId]);
      await dataSource.query('DELETE FROM games WHERE id = $1', [testGameId]);
      await dataSource.destroy();
    }
    await app.close();
  });

  describe('/api/play/start (POST)', () => {
    it('should start a new play session', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/play/start')
        .set('x-user-id', testUserId)
        .send({ gameId: testGameId })
        .expect(200);

      expect(response.body).toHaveProperty('sessionToken');
      expect(response.body).toHaveProperty('heartbeatIntervalSec');
      expect(response.body.heartbeatIntervalSec).toBe(45);

      sessionToken = response.body.sessionToken;
    });

    it('should return 404 for non-existent game', async () => {
      await request(app.getHttpServer())
        .post('/api/play/start')
        .set('x-user-id', testUserId)
        .send({ gameId: uuidv4() })
        .expect(404);
    });

    it('should return 400 for invalid game ID', async () => {
      await request(app.getHttpServer())
        .post('/api/play/start')
        .set('x-user-id', testUserId)
        .send({ gameId: 'invalid-uuid' })
        .expect(400);
    });
  });

  describe('/api/play/heartbeat (POST)', () => {
    it('should successfully send heartbeat and receive new token', async () => {
      await request(app.getHttpServer())
        .post('/api/play/start')
        .set('x-user-id', testUserId)
        .send({ gameId: testGameId })
        .expect(200)
        .then(res => {
          sessionToken = res.body.sessionToken;
        });

      const response = await request(app.getHttpServer())
        .post('/api/play/heartbeat')
        .set('Authorization', `Bearer ${sessionToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('sessionToken');
      expect(response.body.sessionToken).not.toBe(sessionToken);
    });

    it('should return 401 for invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/play/heartbeat')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 for missing token', async () => {
      await request(app.getHttpServer())
        .post('/api/play/heartbeat')
        .expect(401);
    });
  });

  describe('/api/play/stop (POST)', () => {
    it('should successfully stop a session', async () => {
      await request(app.getHttpServer())
        .post('/api/play/start')
        .set('x-user-id', testUserId)
        .send({ gameId: testGameId })
        .expect(200)
        .then(res => {
          sessionToken = res.body.sessionToken;
        });

      await request(app.getHttpServer())
        .post('/api/play/stop')
        .set('Authorization', `Bearer ${sessionToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .post('/api/play/heartbeat')
        .set('Authorization', `Bearer ${sessionToken}`)
        .expect(401);
    });
  });

  describe('Full Play Session Flow', () => {
    it('should handle complete session lifecycle', async () => {
      const startResponse = await request(app.getHttpServer())
        .post('/api/play/start')
        .set('x-user-id', testUserId)
        .send({ gameId: testGameId })
        .expect(200);

      let currentToken = startResponse.body.sessionToken;

      const heartbeatResponse = await request(app.getHttpServer())
        .post('/api/play/heartbeat')
        .set('Authorization', `Bearer ${currentToken}`)
        .expect(200);

      currentToken = heartbeatResponse.body.sessionToken;

      await request(app.getHttpServer())
        .post('/api/play/stop')
        .set('Authorization', `Bearer ${currentToken}`)
        .expect(204);
    });
  });
});