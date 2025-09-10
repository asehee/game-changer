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
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class StartPlayDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { gameId: { required: true, type: () => String } };
    }
}
exports.StartPlayDto = StartPlayDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The ID of the game to start playing',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
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
        description: 'JWT token for the play session',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    __metadata("design:type", String)
], StartPlayResponseDto.prototype, "sessionToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Heartbeat interval in seconds',
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
        description: 'New JWT token with extended expiration',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    __metadata("design:type", String)
], HeartbeatResponseDto.prototype, "sessionToken", void 0);
//# sourceMappingURL=start-play.dto.js.map