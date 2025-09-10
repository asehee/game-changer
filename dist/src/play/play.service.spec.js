"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const play_service_1 = require("./play.service");
const typeorm_1 = require("@nestjs/typeorm");
const play_session_entity_1 = require("./play-session.entity");
const users_service_1 = require("../users/users.service");
const games_service_1 = require("../games/games.service");
const billing_service_1 = require("../billing/billing.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const user_status_enum_1 = require("../common/enums/user-status.enum");
const billing_status_enum_1 = require("../common/enums/billing-status.enum");
const session_status_enum_1 = require("../common/enums/session-status.enum");
describe('PlayService', () => {
    let service;
    let sessionRepository;
    let usersService;
    let gamesService;
    let billingService;
    let jwtService;
    let configService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                play_service_1.PlayService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(play_session_entity_1.PlaySession),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                    },
                },
                {
                    provide: users_service_1.UsersService,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: games_service_1.GamesService,
                    useValue: {
                        findActiveById: jest.fn(),
                    },
                },
                {
                    provide: billing_service_1.BillingService,
                    useValue: {
                        check: jest.fn(),
                        checkStream: jest.fn(),
                        startBillingStream: jest.fn(),
                        stopBillingStream: jest.fn(),
                    },
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: {
                        sign: jest.fn(),
                    },
                },
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();
        service = module.get(play_service_1.PlayService);
        sessionRepository = module.get((0, typeorm_1.getRepositoryToken)(play_session_entity_1.PlaySession));
        usersService = module.get(users_service_1.UsersService);
        gamesService = module.get(games_service_1.GamesService);
        billingService = module.get(billing_service_1.BillingService);
        jwtService = module.get(jwt_1.JwtService);
        configService = module.get(config_1.ConfigService);
    });
    describe('startSession', () => {
        const userId = 'user-123';
        const gameId = 'game-456';
        beforeEach(() => {
            configService.get.mockImplementation((key) => {
                if (key === 'SESSION_JWT_TTL_SEC')
                    return 300;
                if (key === 'HEARTBEAT_INTERVAL_SEC')
                    return 45;
                return null;
            });
        });
        it('should start a new session successfully', async () => {
            const mockUser = { id: userId, status: user_status_enum_1.UserStatus.ACTIVE, wallet: 'wallet1' };
            const mockGame = { id: gameId, title: 'Test Game', isActive: true };
            const mockSession = { id: 'session-789', userId, gameId, status: session_status_enum_1.SessionStatus.ACTIVE };
            usersService.findById.mockResolvedValue(mockUser);
            gamesService.findActiveById.mockResolvedValue(mockGame);
            billingService.check.mockResolvedValue(billing_status_enum_1.BillingStatus.OK);
            sessionRepository.find.mockResolvedValue([]);
            sessionRepository.create.mockReturnValue(mockSession);
            sessionRepository.save.mockResolvedValue(mockSession);
            jwtService.sign.mockReturnValue('mock-jwt-token');
            const result = await service.startSession(userId, gameId);
            expect(result).toHaveProperty('sessionToken', 'mock-jwt-token');
            expect(result).toHaveProperty('heartbeatIntervalSec', 45);
            expect(billingService.startBillingStream).toHaveBeenCalledWith('session-789', userId);
        });
        it('should throw ForbiddenException if user is blocked', async () => {
            const mockUser = { id: userId, status: user_status_enum_1.UserStatus.BLOCKED, wallet: 'wallet1' };
            usersService.findById.mockResolvedValue(mockUser);
            await expect(service.startSession(userId, gameId)).rejects.toThrow(common_1.ForbiddenException);
        });
        it('should throw NotFoundException if game is not active', async () => {
            const mockUser = { id: userId, status: user_status_enum_1.UserStatus.ACTIVE, wallet: 'wallet1' };
            usersService.findById.mockResolvedValue(mockUser);
            gamesService.findActiveById.mockRejectedValue(new common_1.NotFoundException());
            await expect(service.startSession(userId, gameId)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should throw ForbiddenException if billing check fails', async () => {
            const mockUser = { id: userId, status: user_status_enum_1.UserStatus.ACTIVE, wallet: 'wallet1' };
            const mockGame = { id: gameId, title: 'Test Game', isActive: true };
            usersService.findById.mockResolvedValue(mockUser);
            gamesService.findActiveById.mockResolvedValue(mockGame);
            billingService.check.mockResolvedValue(billing_status_enum_1.BillingStatus.INSUFFICIENT);
            await expect(service.startSession(userId, gameId)).rejects.toThrow(common_1.ForbiddenException);
        });
    });
    describe('heartbeat', () => {
        const sessionId = 'session-123';
        const userId = 'user-456';
        const gameId = 'game-789';
        beforeEach(() => {
            configService.get.mockImplementation((key) => {
                if (key === 'SESSION_JWT_TTL_SEC')
                    return 300;
                if (key === 'HEARTBEAT_INTERVAL_SEC')
                    return 45;
                return null;
            });
        });
        it('should renew session successfully', async () => {
            const mockSession = {
                id: sessionId,
                userId,
                gameId,
                status: session_status_enum_1.SessionStatus.ACTIVE,
                expiresAt: new Date(Date.now() + 60000),
            };
            sessionRepository.findOne.mockResolvedValue(mockSession);
            billingService.checkStream.mockResolvedValue(billing_status_enum_1.BillingStatus.OK);
            sessionRepository.save.mockResolvedValue(mockSession);
            jwtService.sign.mockReturnValue('new-jwt-token');
            const result = await service.heartbeat(sessionId, userId, gameId);
            expect(result).toBe('new-jwt-token');
            expect(sessionRepository.save).toHaveBeenCalled();
        });
        it('should revoke session if billing check fails', async () => {
            const mockSession = {
                id: sessionId,
                userId,
                gameId,
                status: session_status_enum_1.SessionStatus.ACTIVE,
                expiresAt: new Date(Date.now() + 60000),
            };
            sessionRepository.findOne.mockResolvedValue(mockSession);
            billingService.checkStream.mockResolvedValue(billing_status_enum_1.BillingStatus.STOPPED);
            await expect(service.heartbeat(sessionId, userId, gameId)).rejects.toThrow(common_1.ForbiddenException);
            expect(billingService.stopBillingStream).toHaveBeenCalledWith(sessionId);
        });
    });
});
//# sourceMappingURL=play.service.spec.js.map