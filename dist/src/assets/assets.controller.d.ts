import { Response } from 'express';
import { AssetsService } from './assets.service';
import { PlayService } from '../play/play.service';
export declare class AssetsController {
    private readonly assetsService;
    private readonly playService;
    private readonly logger;
    constructor(assetsService: AssetsService, playService: PlayService);
    streamAsset(assetId: string, rangeHeader: string | undefined, ifNoneMatch: string | undefined, req: any, res: Response): Promise<void>;
}
