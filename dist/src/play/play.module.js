"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const play_session_entity_1 = require("./play-session.entity");
const play_service_1 = require("./play.service");
const play_controller_1 = require("./play.controller");
const users_module_1 = require("../users/users.module");
const games_module_1 = require("../games/games.module");
const billing_module_1 = require("../billing/billing.module");
const auth_module_1 = require("../auth/auth.module");
let PlayModule = class PlayModule {
};
exports.PlayModule = PlayModule;
exports.PlayModule = PlayModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([play_session_entity_1.PlaySession]),
            users_module_1.UsersModule,
            games_module_1.GamesModule,
            billing_module_1.BillingModule,
            auth_module_1.AuthModule,
        ],
        controllers: [play_controller_1.PlayController],
        providers: [play_service_1.PlayService],
        exports: [play_service_1.PlayService],
    })
], PlayModule);
//# sourceMappingURL=play.module.js.map