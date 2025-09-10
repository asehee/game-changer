import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Asset } from './asset.entity';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const stat = promisify(fs.stat);

export interface RangeInfo {
  start: number;
  end: number;
  total: number;
}

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);
  private readonly storageRoot: string;

  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    private readonly configService: ConfigService,
  ) {
    this.storageRoot = this.configService.get('ASSET_STORAGE_ROOT', './storage/assets');
  }

  async findById(id: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { id },
      relations: ['game'],
    });
    
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    
    return asset;
  }

  async findByGameId(gameId: string): Promise<Asset[]> {
    return this.assetRepository.find({
      where: { gameId },
    });
  }

  async validateAssetAccess(assetId: string, gameId: string): Promise<Asset> {
    const asset = await this.findById(assetId);
    
    if (asset.gameId !== gameId) {
      throw new NotFoundException('Asset not found for this game');
    }
    
    return asset;
  }

  getAssetFullPath(asset: Asset): string {
    const safePath = path.normalize(asset.path).replace(/^(\.\.(\/|\\|$))+/, '');
    return path.join(this.storageRoot, safePath);
  }

  async getAssetStats(asset: Asset): Promise<fs.Stats> {
    const fullPath = this.getAssetFullPath(asset);
    
    try {
      return await stat(fullPath);
    } catch (error) {
      this.logger.error(`Failed to stat asset file: ${fullPath}`, error);
      throw new NotFoundException('Asset file not found');
    }
  }

  parseRangeHeader(rangeHeader: string | undefined, fileSize: number): RangeInfo | null {
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

  createReadStream(filePath: string, range?: RangeInfo): fs.ReadStream {
    const options: any = {};
    
    if (range) {
      options.start = range.start;
      options.end = range.end;
    }
    
    return fs.createReadStream(filePath, options);
  }

  async createAsset(data: {
    gameId: string;
    path: string;
    size: number;
    mime: string;
    etag?: string;
  }): Promise<Asset> {
    const asset = this.assetRepository.create({
      ...data,
      size: data.size.toString(),
    });
    
    return this.assetRepository.save(asset);
  }

  async updateAssetEtag(id: string, etag: string): Promise<Asset> {
    const asset = await this.findById(id);
    asset.etag = etag;
    return this.assetRepository.save(asset);
  }

  generateEtag(stats: fs.Stats): string {
    return `"${stats.mtime.getTime().toString(16)}-${stats.size.toString(16)}"`;
  }
}