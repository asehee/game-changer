import { Game } from '../games/game.entity';
export declare class Asset {
    id: string;
    gameId: string;
    path: string;
    etag: string;
    size: string;
    mime: string;
    createdAt: Date;
    game: Game;
}
