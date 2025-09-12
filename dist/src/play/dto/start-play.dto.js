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
exports.HeartbeatResponseDto = exports.StartPlayResponseDto = exports.StartPlayDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class StartPlayDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { walletAddress: { required: true, type: () => String }, gameId: { required: true, type: () => String } };
    }
}
exports.StartPlayDto = StartPlayDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '지갑 주소',
        example: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
    }),
    __metadata("design:type", String)
], StartPlayDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '플레이할 게임의 ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], StartPlayDto.prototype, "gameId", void 0);
class StartPlayResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { sessionToken: { required: true, type: () => String }, heartbeatIntervalSec: { required: true, type: () => Number } };
    }
}
exports.StartPlayResponseDto = StartPlayResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '플레이 세션용 JWT 토큰',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    __metadata("design:type", String)
], StartPlayResponseDto.prototype, "sessionToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '하트비트 간격(초)',
        example: 45,
    }),
    __metadata("design:type", Number)
], StartPlayResponseDto.prototype, "heartbeatIntervalSec", void 0);
class HeartbeatResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { sessionToken: { required: true, type: () => String } };
    }
}
exports.HeartbeatResponseDto = HeartbeatResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '만료 시간이 연장된 새 JWT 토큰',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    __metadata("design:type", String)
], HeartbeatResponseDto.prototype, "sessionToken", void 0);
//# sourceMappingURL=start-play.dto.js.map