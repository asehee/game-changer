import { PlaySession } from '../play/play-session.entity';
import { Asset } from '../assets/asset.entity';
export declare class Game {
    id: string;
    title: string;
    version: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    playSessions: PlaySession[];
    assets: Asset[];
}
