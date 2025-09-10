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
var AssetsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const assets_service_1 = require("./assets.service");
const play_service_1 = require("../play/play.service");
const session_jwt_guard_1 = require("../auth/session-jwt.guard");
const throttler_1 = require("@nestjs/throttler");
let AssetsController = AssetsController_1 = class AssetsController {
    constructor(assetsService, playService) {
        this.assetsService = assetsService;
        this.playService = playService;
        this.logger = new common_1.Logger(AssetsController_1.name);
    }
    async streamAsset(assetId, rangeHeader, ifNoneMatch, req, res) {
        const payload = req.user;
        await this.playService.assertSessionActive(payload.sid, payload.uid, payload.gid);
        const asset = await this.assetsService.validateAssetAccess(assetId, payload.gid);
        const fullPath = this.assetsService.getAssetFullPath(asset);
        const stats = await this.assetsService.getAssetStats(asset);
        const etag = this.assetsService.generateEtag(stats);
        if (ifNoneMatch && ifNoneMatch === etag) {
            res.status(common_1.HttpStatus.NOT_MODIFIED).send();
            return;
        }
        const range = this.assetsService.parseRangeHeader(rangeHeader, stats.size);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('ETag', etag);
        res.setHeader('Content-Type', asset.mime || 'application/octet-stream');
        if (range) {
            const contentLength = range.end - range.start + 1;
            res.status(common_1.HttpStatus.PARTIAL_CONTENT);
            res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${stats.size}`);
            res.setHeader('Content-Length', contentLength);
            const stream = this.assetsService.createReadStream(fullPath, range);
            stream.pipe(res);
            stream.on('error', (error) => {
                this.logger.error(`Stream error for asset ${assetId}:`, error);
                if (!res.headersSent) {
                    res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send('Stream error');
                }
            });
        }
        else {
            res.status(common_1.HttpStatus.OK);
            res.setHeader('Content-Length', stats.size);
            const stream = this.assetsService.createReadStream(fullPath);
            stream.pipe(res);
            stream.on('error', (error) => {
                this.logger.error(`Stream error for asset ${assetId}:`, error);
                if (!res.headersSent) {
                    res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send('Stream error');
                }
            });
        }
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Get)(':assetId'),
    (0, throttler_1.Throttle)({ default: { limit: 100, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Stream asset with Range support' }),
    (0, swagger_1.ApiParam)({
        name: 'assetId',
        description: 'Asset ID',
        type: 'string',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'Range',
        description: 'HTTP Range header for partial content',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Full content',
        headers: {
            'Content-Type': {
                description: 'MIME type of the asset',
            },
            'Content-Length': {
                description: 'Size of the content',
            },
            'Accept-Ranges': {
                description: 'bytes',
            },
            'Cache-Control': {
                description: 'Cache policy',
            },
            'ETag': {
                description: 'Entity tag for caching',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 206,
        description: 'Partial content',
        headers: {
            'Content-Range': {
                description: 'Byte range being returned',
            },
            'Content-Length': {
                description: 'Size of the partial content',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - invalid session' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - billing failed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asset not found' }),
    (0, swagger_1.ApiResponse)({ status: 416, description: 'Range Not Satisfiable' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, common_1.Headers)('range')),
    __param(2, (0, common_1.Headers)('if-none-match')),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "streamAsset", null);
exports.AssetsController = AssetsController = AssetsController_1 = __decorate([
    (0, swagger_1.ApiTags)('assets'),
    (0, common_1.Controller)('api/assets'),
    (0, common_1.UseGuards)(session_jwt_guard_1.SessionJwtGuard),
    (0, swagger_1.ApiBearerAuth)('session-jwt'),
    __metadata("design:paramtypes", [assets_service_1.AssetsService,
        play_service_1.PlayService])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map