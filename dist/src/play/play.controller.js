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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const play_service_1 = require("./play.service");
const session_jwt_guard_1 = require("../auth/session-jwt.guard");
const start_play_dto_1 = require("./dto/start-play.dto");
const throttler_1 = require("@nestjs/throttler");
let PlayController = class PlayController {
    constructor(playService) {
        this.playService = playService;
    }
    async start(dto) {
        return this.playService.startSession(dto.walletAddress, dto.gameId);
    }
    async heartbeat(req) {
        const payload = req.user;
        const newToken = await this.playService.heartbeat(payload.sid, payload.uid, payload.gid);
        return { sessionToken: newToken };
    }
    async stop(req) {
        const payload = req.user;
        await this.playService.stopSession(payload.sid, payload.uid);
    }
};
exports.PlayController = PlayController;
__decorate([
    (0, common_1.Post)('start'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Start a new play session',
        description: 'Creates a new play session for the user with the specified wallet address and game.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Session started successfully',
        type: start_play_dto_1.StartPlayResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid wallet address format or game ID' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'User blocked or billing failed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Game not found or inactive' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: require("./dto/start-play.dto").StartPlayResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [start_play_dto_1.StartPlayDto]),
    __metadata("design:returntype", Promise)
], PlayController.prototype, "start", null);
__decorate([
    (0, common_1.Post)('heartbeat'),
    (0, common_1.UseGuards)(session_jwt_guard_1.SessionJwtGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 2, ttl: 60000 } }),
    (0, swagger_1.ApiBearerAuth)('session-jwt'),
    (0, swagger_1.ApiOperation)({ summary: 'Send heartbeat to maintain session' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Heartbeat successful, new token issued',
        type: start_play_dto_1.HeartbeatResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired token' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Session revoked or billing failed' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: require("./dto/start-play.dto").HeartbeatResponseDto }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayController.prototype, "heartbeat", null);
__decorate([
    (0, common_1.Post)('stop'),
    (0, common_1.UseGuards)(session_jwt_guard_1.SessionJwtGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBearerAuth)('session-jwt'),
    (0, swagger_1.ApiOperation)({ summary: 'Stop the current play session' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Session stopped successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired token' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayController.prototype, "stop", null);
exports.PlayController = PlayController = __decorate([
    (0, swagger_1.ApiTags)('play'),
    (0, common_1.Controller)('api/play'),
    __metadata("design:paramtypes", [play_service_1.PlayService])
], PlayController);
//# sourceMappingURL=play.controller.js.map