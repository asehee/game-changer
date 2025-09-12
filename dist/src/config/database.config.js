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
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = exports.dataSourceOptions = exports.getDatabaseConfig = void 0;
const typeorm_1 = require("typeorm");
const path = __importStar(require("path"));
const getDatabaseConfig = (configService) => {
    const databaseUrl = configService.get('DATABASE_URL');
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not defined');
    }
    const url = new URL(databaseUrl);
    return {
        type: 'mysql',
        host: url.hostname,
        port: parseInt(url.port || '3306'),
        username: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
        migrations: [path.join(__dirname, '..', 'migrations', '*.{ts,js}')],
        synchronize: true,
        logging: configService.get('NODE_ENV') === 'development',
    };
};
exports.getDatabaseConfig = getDatabaseConfig;
exports.dataSourceOptions = {
    type: 'mysql',
    url: process.env.DATABASE_URL || 'mysql://root@localhost:3306/game_platform',
    entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [path.join(__dirname, '..', 'migrations', '*.{ts,js}')],
    synchronize: process.env.NODE_ENV === 'development' ? true : false,
    logging: process.env.NODE_ENV === 'development',
};
exports.dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
//# sourceMappingURL=database.config.js.map