"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AssetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const asset_entity_1 = require("./asset.entity");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const stat = (0, util_1.promisify)(fs.stat);
let AssetsService = AssetsService_1 = class AssetsService {
    constructor(assetRepository, configService) {
        this.assetRepository = assetRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(AssetsService_1.name);
        this.storageRoot = this.configService.get('ASSET_STORAGE_ROOT', './storage/assets');
    }
    async findById(id) {
        const asset = await this.assetRepository.findOne({
            where: { id },
            relations: ['game'],
        });
        if (!asset) {
            throw new common_1.NotFoundException(`Asset with ID ${id} not found`);
        }
        return asset;
    }
    async findByGameId(gameId) {
        return this.assetRepository.find({
            where: { gameId },
        });
    }
    async validateAssetAccess(assetId, gameId) {
        const asset = await this.findById(assetId);
        if (asset.gameId !== gameId) {
            throw new common_1.NotFoundException('Asset not found for this game');
        }
        return asset;
    }
    getAssetFullPath(asset) {
        const safePath = path.normalize(asset.path).replace(/^(\.\.(\/|\\|$))+/, '');
        return path.join(this.storageRoot, safePath);
    }
    async getAssetStats(asset) {
        const fullPath = this.getAssetFullPath(asset);
        try {
            return await stat(fullPath);
        }
        catch (error) {
            this.logger.error(`Failed to stat asset file: ${fullPath}`, error);
            throw new common_1.NotFoundException('Asset file not found');
        }
    }
    parseRangeHeader(rangeHeader, fileSize) {
        if (!rangeHeader) {
            return null;
        }
        const matches = rangeHeader.match(/bytes=(\d+)-(\d*)/);
        if (!matches) {
            return null;
        }
        const start = parseInt(matches[1], 10);
        const end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;
        if (start < 0 || start >= fileSize || end >= fileSize || start > end) {
            return null;
        }
        return {
            start,
            end,
            total: fileSize,
        };
    }
    createReadStream(filePath, range) {
        const options = {};
        if (range) {
            options.start = range.start;
            options.end = range.end;
        }
        return fs.createReadStream(filePath, options);
    }
    async createAsset(data) {
        const asset = this.assetRepository.create({
            ...data,
            size: data.size.toString(),
        });
        return this.assetRepository.save(asset);
    }
    async updateAssetEtag(id, etag) {
        const asset = await this.findById(id);
        asset.etag = etag;
        return this.assetRepository.save(asset);
    }
    generateEtag(stats) {
        return `"${stats.mtime.getTime().toString(16)}-${stats.size.toString(16)}"`;
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = AssetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(asset_entity_1.Asset)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map