"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PlayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const play_session_entity_1 = require("./play-session.entity");
const users_service_1 = require("../users/users.service");
const games_service_1 = require("../games/games.service");
const billing_service_1 = require("../billing/billing.service");
const session_status_enum_1 = require("../common/enums/session-status.enum");
const billing_status_enum_1 = require("../common/enums/billing-status.enum");
const user_status_enum_1 = require("../common/enums/user-status.enum");
let PlayService = PlayService_1 = class PlayService {
    constructor(sessionRepository, usersService, gamesService, billingService, jwtService, configService) {
        this.sessionRepository = sessionRepository;
        this.usersService = usersService;
        this.gamesService = gamesService;
        this.billingService = billingService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(PlayService_1.name);
    }
    async startSession(userId, gameId) {
        const user = await this.usersService.findById(userId);
        if (user.status === user_status_enum_1.UserStatus.BLOCKED) {
            throw new common_1.ForbiddenException('User is blocked');
        }
        const game = await this.gamesService.findActiveById(gameId);
        if (!game) {
            throw new common_1.NotFoundException('Game not found or inactive');
        }
        const billingStatus = await this.billingService.check(userId);
        if (billingStatus !== billing_status_enum_1.BillingStatus.OK) {
            throw new common_1.ForbiddenException('Billing check failed');
        }
        await this.endPreviousSessions(userId);
        const ttlSeconds = this.configService.get('SESSION_JWT_TTL_SEC', 300);
        const heartbeatInterval = this.configService.get('HEARTBEAT_INTERVAL_SEC', 45);
        const session = this.sessionRepository.create({
            userId,
            gameId,
            status: session_status_enum_1.SessionStatus.ACTIVE,
            expiresAt: new Date(Date.now() + ttlSeconds * 1000),
            lastHeartbeatAt: new Date(),
            billingStatus: billing_status_enum_1.BillingStatus.OK,
        });
        const savedSession = await this.sessionRepository.save(session);
        await this.billingService.startBillingStream(savedSession.id, userId);
        const sessionToken = this.signSessionJwt({
            sid: savedSession.id,
            uid: userId,
            gid: gameId,
            hb: heartbeatInterval,
        });
        this.logger.log(`Session started: ${savedSession.id} for user ${userId} game ${gameId}`);
        return {
            sessionToken,
            heartbeatIntervalSec: heartbeatInterval,
        };
    }
    async heartbeat(sessionId, userId, gameId) {
        const session = await this.sessionRepository.findOne({
            where: {
                id: sessionId,
                userId,
                gameId,
                status: session_status_enum_1.SessionStatus.ACTIVE,
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
        });
        if (!session) {
            this.logger.warn(`Heartbeat failed: session ${sessionId} not found or expired`);
            throw new common_1.UnauthorizedException('Session not found or expired');
        }
        const billingStatus = await this.billingService.checkStream(sessionId);
        if (billingStatus !== billing_status_enum_1.BillingStatus.OK) {
            await this.revokeSession(sessionId, billing_status_enum_1.BillingStatus.STOPPED);
            throw new common_1.ForbiddenException('Billing stream check failed');
        }
        const ttlSeconds = this.configService.get('SESSION_JWT_TTL_SEC', 300);
        const heartbeatInterval = this.configService.get('HEARTBEAT_INTERVAL_SEC', 45);
        session.lastHeartbeatAt = new Date();
        session.expiresAt = new Date(Date.now() + ttlSeconds * 1000);
        session.billingStatus = billingStatus;
        await this.sessionRepository.save(session);
        const newToken = this.signSessionJwt({
            sid: sessionId,
            uid: userId,
            gid: gameId,
            hb: heartbeatInterval,
        });
        this.logger.log(`Heartbeat success: session ${sessionId}`);
        return newToken;
    }
    async stopSession(sessionId, userId) {
        const session = await this.sessionRepository.findOne({
            where: {
                id: sessionId,
                userId,
                status: session_status_enum_1.SessionStatus.ACTIVE,
            },
        });
        if (!session) {
            return;
        }
        session.status = session_status_enum_1.SessionStatus.ENDED;
        await this.sessionRepository.save(session);
        await this.billingService.stopBillingStream(sessionId);
        this.logger.log(`Session stopped: ${sessionId}`);
    }
    async assertSessionActive(sessionId, userId, gameId) {
        const session = await this.sessionRepository.findOne({
            where: {
                id: sessionId,
                userId,
                gameId,
                status: session_status_enum_1.SessionStatus.ACTIVE,
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
        });
        if (!session) {
            throw new common_1.UnauthorizedException('Session not active');
        }
        const billingStatus = await this.billingService.checkStream(sessionId);
        if (billingStatus !== billing_status_enum_1.BillingStatus.OK) {
            await this.revokeSession(sessionId, billingStatus);
            throw new common_1.ForbiddenException('Billing check failed');
        }
    }
    async revokeSession(sessionId, reason) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId },
        });
        if (!session) {
            return;
        }
        session.status = session_status_enum_1.SessionStatus.REVOKED;
        session.billingStatus = reason;
        await this.sessionRepository.save(session);
        await this.billingService.stopBillingStream(sessionId);
        this.logger.warn(`Session revoked: ${sessionId}, reason: ${reason}`);
    }
    async cleanupExpiredSessions() {
        const expiredSessions = await this.sessionRepository.find({
            where: {
                status: session_status_enum_1.SessionStatus.ACTIVE,
                expiresAt: (0, typeorm_2.LessThan)(new Date()),
            },
        });
        for (const session of expiredSessions) {
            session.status = session_status_enum_1.SessionStatus.EXPIRED;
            await this.sessionRepository.save(session);
            await this.billingService.stopBillingStream(session.id);
            this.logger.log(`Session expired: ${session.id}`);
        }
    }
    async endPreviousSessions(userId) {
        const activeSessions = await this.sessionRepository.find({
            where: {
                userId,
                status: session_status_enum_1.SessionStatus.ACTIVE,
            },
        });
        for (const session of activeSessions) {
            session.status = session_status_enum_1.SessionStatus.ENDED;
            await this.sessionRepository.save(session);
            await this.billingService.stopBillingStream(session.id);
        }
    }
    signSessionJwt(payload) {
        const ttlSeconds = this.configService.get('SESSION_JWT_TTL_SEC', 300);
        return this.jwtService.sign(payload, {
            expiresIn: `${ttlSeconds}s`,
        });
    }
};
exports.PlayService = PlayService;
exports.PlayService = PlayService = PlayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(play_session_entity_1.PlaySession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        games_service_1.GamesService,
        billing_service_1.BillingService,
        jwt_1.JwtService,
        config_1.ConfigService])
], PlayService);
//# sourceMappingURL=play.service.js.map