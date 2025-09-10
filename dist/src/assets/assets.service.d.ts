import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Asset } from './asset.entity';
import * as fs from 'fs';
export interface RangeInfo {
    start: number;
    end: number;
    total: number;
}
export declare class AssetsService {
    private readonly assetRepository;
    private readonly configService;
    private readonly logger;
    private readonly storageRoot;
    constructor(assetRepository: Repository<Asset>, configService: ConfigService);
    findById(id: string): Promise<Asset>;
    findByGameId(gameId: string): Promise<Asset[]>;
    validateAssetAccess(assetId: string, gameId: string): Promise<Asset>;
    getAssetFullPath(asset: Asset): string;
    getAssetStats(asset: Asset): Promise<fs.Stats>;
    parseRangeHeader(rangeHeader: string | undefined, fileSize: number): RangeInfo | null;
    createReadStream(filePath: string, range?: RangeInfo): fs.ReadStream;
    createAsset(data: {
        gameId: string;
        path: string;
        size: number;
        mime: string;
        etag?: string;
    }): Promise<Asset>;
    updateAssetEtag(id: string, etag: string): Promise<Asset>;
    generateEtag(stats: fs.Stats): string;
}
