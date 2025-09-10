"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("../src/app.module");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
describe('Play Session E2E Tests', () => {
    let app;
    let dataSource;
    let testUserId;
    let testGameId;
    let sessionToken;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        await app.init();
        dataSource = app.get(typeorm_1.DataSource);
        testUserId = (0, uuid_1.v4)();
        testGameId = (0, uuid_1.v4)();
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
            const response = await (0, supertest_1.default)(app.getHttpServer())
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
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/play/start')
                .set('x-user-id', testUserId)
                .send({ gameId: (0, uuid_1.v4)() })
                .expect(404);
        });
        it('should return 400 for invalid game ID', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/play/start')
                .set('x-user-id', testUserId)
                .send({ gameId: 'invalid-uuid' })
                .expect(400);
        });
    });
    describe('/api/play/heartbeat (POST)', () => {
        it('should successfully send heartbeat and receive new token', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/play/start')
                .set('x-user-id', testUserId)
                .send({ gameId: testGameId })
                .expect(200)
                .then(res => {
                sessionToken = res.body.sessionToken;
            });
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/play/heartbeat')
                .set('Authorization', `Bearer ${sessionToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('sessionToken');
            expect(response.body.sessionToken).not.toBe(sessionToken);
        });
        it('should return 401 for invalid token', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/play/heartbeat')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
        it('should return 401 for missing token', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/play/heartbeat')
                .expect(401);
        });
    });
    describe('/api/play/stop (POST)', () => {
        it('should successfully stop a session', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/play/start')
                .set('x-user-id', testUserId)
                .send({ gameId: testGameId })
                .expect(200)
                .then(res => {
                sessionToken = res.body.sessionToken;
            });
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/play/stop')
                .set('Authorization', `Bearer ${sessionToken}`)
                .expect(204);
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/play/heartbeat')
                .set('Authorization', `Bearer ${sessionToken}`)
                .expect(401);
        });
    });
    describe('Full Play Session Flow', () => {
        it('should handle complete session lifecycle', async () => {
            const startResponse = await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/play/start')
                .set('x-user-id', testUserId)
                .send({ gameId: testGameId })
                .expect(200);
            let currentToken = startResponse.body.sessionToken;
            const heartbeatResponse = await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/play/heartbeat')
                .set('Authorization', `Bearer ${currentToken}`)
                .expect(200);
            currentToken = heartbeatResponse.body.sessionToken;
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/play/stop')
                .set('Authorization', `Bearer ${currentToken}`)
                .expect(204);
        });
    });
});
//# sourceMappingURL=app.e2e-spec.js.map