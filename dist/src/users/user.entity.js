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
exports.User = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_status_enum_1 = require("../common/enums/user-status.enum");
const play_session_entity_1 = require("../play/play-session.entity");
let User = class User {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, wallet: { required: true, type: () => String }, status: { required: true, enum: require("../common/enums/user-status.enum").UserStatus }, connectedWallet: { required: true, type: () => String }, tempWallet: { required: true, type: () => String }, isFirstChargeCompleted: { required: true, type: () => Boolean }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, playSessions: { required: true, type: () => [require("../play/play-session.entity").PlaySession] } };
    }
};
exports.User = User;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '사용자 고유 식별자 (UUID)',
        example: '550e8400-e29b-41d4-a716-446655440000'
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '지갑 주소',
        example: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6'
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    (0, typeorm_1.Index)('idx_users_wallet'),
    __metadata("design:type", String)
], User.prototype, "wallet", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '사용자 상태',
        enum: user_status_enum_1.UserStatus,
        example: user_status_enum_1.UserStatus.ACTIVE
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: user_status_enum_1.UserStatus,
        default: user_status_enum_1.UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '지갑 연결에서 받은 연결된 지갑 주소',
        example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
        required: false
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, typeorm_1.Index)('idx_users_connected_wallet'),
    __metadata("design:type", String)
], User.prototype, "connectedWallet", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '첫 충전용 임시 지갑 주소 (일회성)',
        example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
        required: false
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, typeorm_1.Index)('idx_users_temp_wallet'),
    __metadata("design:type", String)
], User.prototype, "tempWallet", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '첫 충전 완료 여부',
        example: false
    }),
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isFirstChargeCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '사용자 생성 시간',
        example: '2024-01-15T10:30:00.000Z'
    }),
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '사용자 마지막 업데이트 시간',
        example: '2024-01-15T10:30:00.000Z'
    }),
    (0, typeorm_1.UpdateDateColumn)({ type: 'datetime' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => play_session_entity_1.PlaySession, (session) => session.user),
    __metadata("design:type", Array)
], User.prototype, "playSessions", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map