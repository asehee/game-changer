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
exports.GamesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const game_entity_1 = require("./game.entity");
let GamesService = class GamesService {
    constructor(gameRepository) {
        this.gameRepository = gameRepository;
    }
    async findById(id) {
        const game = await this.gameRepository.findOne({ where: { id } });
        if (!game) {
            throw new common_1.NotFoundException(`Game with ID ${id} not found`);
        }
        return game;
    }
    async findActiveById(id) {
        const game = await this.gameRepository.findOne({
            where: { id, isActive: true },
        });
        if (!game) {
            throw new common_1.NotFoundException(`Active game with ID ${id} not found`);
        }
        return game;
    }
    async findAll() {
        return this.gameRepository.find({ where: { isActive: true } });
    }
    async create(data) {
        const game = this.gameRepository.create(data);
        return this.gameRepository.save(game);
    }
    async update(id, data) {
        const game = await this.findById(id);
        Object.assign(game, data);
        return this.gameRepository.save(game);
    }
    async deactivate(id) {
        const game = await this.findById(id);
        game.isActive = false;
        return this.gameRepository.save(game);
    }
    async activate(id) {
        const game = await this.findById(id);
        game.isActive = true;
        return this.gameRepository.save(game);
    }
};
exports.GamesService = GamesService;
exports.GamesService = GamesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(game_entity_1.Game)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GamesService);
//# sourceMappingURL=games.service.js.map