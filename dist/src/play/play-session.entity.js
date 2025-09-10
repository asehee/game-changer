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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaySession = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const session_status_enum_1 = require("../common/enums/session-status.enum");
const billing_status_enum_1 = require("../common/enums/billing-status.enum");
const user_entity_1 = require("../users/user.entity");
const game_entity_1 = require("../games/game.entity");
let PlaySession = class PlaySession {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, userId: { required: true, type: () => String }, gameId: { required: true, type: () => String }, status: { required: true, enum: require("../common/enums/session-status.enum").SessionStatus }, expiresAt: { required: true, type: () => Date }, lastHeartbeatAt: { required: true, type: () => Date }, billingStatus: { required: true, enum: require("../common/enums/billing-status.enum").BillingStatus }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, user: { required: true, type: () => require("../users/user.entity").User }, game: { required: true, type: () => require("../games/game.entity").Game } };
    }
};
exports.PlaySession = PlaySession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PlaySession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PlaySession.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PlaySession.prototype, "gameId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: session_status_enum_1.SessionStatus,
        default: session_status_enum_1.SessionStatus.ACTIVE,
    }),
    (0, typeorm_1.Index)('idx_play_sessions_status'),
    __metadata("design:type", String)
], PlaySession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], PlaySession.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], PlaySession.prototype, "lastHeartbeatAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: billing_status_enum_1.BillingStatus,
        default: billing_status_enum_1.BillingStatus.UNKNOWN,
    }),
    __metadata("design:type", String)
], PlaySession.prototype, "billingStatus", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime' }),
    __metadata("design:type", Date)
], PlaySession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'datetime' }),
    __metadata("design:type", Date)
], PlaySession.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.playSessions),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], PlaySession.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => game_entity_1.Game, (game) => game.playSessions),
    (0, typeorm_1.JoinColumn)({ name: 'gameId' }),
    __metadata("design:type", game_entity_1.Game)
], PlaySession.prototype, "game", void 0);
exports.PlaySession = PlaySession = __decorate([
    (0, typeorm_1.Entity)('play_sessions'),
    (0, typeorm_1.Index)('idx_play_sessions_user_game', ['userId', 'gameId']),
    (0, typeorm_1.Index)('idx_play_sessions_status_expires', ['status', 'expiresAt'])
], PlaySession);
//# sourceMappingURL=play-session.entity.js.map