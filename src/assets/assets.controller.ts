import {
  Controller,
  Get,
  Param,
  Res,
  Headers,
  UseGuards,
  Req,
  HttpStatus,
  StreamableFile,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AssetsService } from './assets.service';
import { PlayService } from '../play/play.service';
import { SessionJwtGuard } from '../auth/session-jwt.guard';
import { SessionJwtPayload } from '../auth/session-jwt.strategy';
import { Throttle } from '@nestjs/throttler';

@ApiTags('assets')
@Controller('api/assets')
@UseGuards(SessionJwtGuard)
@ApiBearerAuth('session-jwt')
export class AssetsController {
  private readonly logger = new Logger(AssetsController.name);

  constructor(
    private readonly assetsService: AssetsService,
    private readonly playService: PlayService,
  ) {}

  @Get(':assetId')
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({ summary: 'Stream asset with Range support' })
  @ApiParam({
    name: 'assetId',
    description: 'Asset ID',
    type: 'string',
  })
  @ApiHeader({
    name: 'Range',
    description: 'HTTP Range header for partial content',
    required: false,
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid session' })
  @ApiResponse({ status: 403, description: 'Forbidden - billing failed' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({ status: 416, description: 'Range Not Satisfiable' })
  async streamAsset(
    @Param('assetId') assetId: string,
    @Headers('range') rangeHeader: string | undefined,
    @Headers('if-none-match') ifNoneMatch: string | undefined,
    @Req() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const payload: SessionJwtPayload = req.user;

    await this.playService.assertSessionActive(
      payload.sid,
      payload.uid,
      payload.gid,
    );

    const asset = await this.assetsService.validateAssetAccess(assetId, payload.gid);

    const fullPath = this.assetsService.getAssetFullPath(asset);
    const stats = await this.assetsService.getAssetStats(asset);
    const etag = this.assetsService.generateEtag(stats);

    if (ifNoneMatch && ifNoneMatch === etag) {
      res.status(HttpStatus.NOT_MODIFIED).send();
      return;
    }

    const range = this.assetsService.parseRangeHeader(rangeHeader, stats.size);

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('ETag', etag);
    res.setHeader('Content-Type', asset.mime || 'application/octet-stream');

    if (range) {
      const contentLength = range.end - range.start + 1;
      
      res.status(HttpStatus.PARTIAL_CONTENT);
      res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${stats.size}`);
      res.setHeader('Content-Length', contentLength);

      const stream = this.assetsService.createReadStream(fullPath, range);
      stream.pipe(res);

      stream.on('error', (error) => {
        this.logger.error(`Stream error for asset ${assetId}:`, error);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Stream error');
        }
      });
    } else {
      res.status(HttpStatus.OK);
      res.setHeader('Content-Length', stats.size);

      const stream = this.assetsService.createReadStream(fullPath);
      stream.pipe(res);

      stream.on('error', (error) => {
        this.logger.error(`Stream error for asset ${assetId}:`, error);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Stream error');
        }
      });
    }
  }
}