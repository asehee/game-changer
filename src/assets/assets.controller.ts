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

@ApiTags('자산')
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
  @ApiOperation({ summary: 'Range 지원 자산 스트리밍' })
  @ApiParam({
    name: 'assetId',
    description: '자산 ID',
    type: 'string',
  })
  @ApiHeader({
    name: 'Range',
    description: '부분 콘텐츠를 위한 HTTP Range 헤더',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '전체 콘텐츠',
    headers: {
      'Content-Type': {
        description: '자산의 MIME 타입',
      },
      'Content-Length': {
        description: '콘텐츠 크기',
      },
      'Accept-Ranges': {
        description: '바이트',
      },
      'Cache-Control': {
        description: '캐시 정책',
      },
      'ETag': {
        description: '캐시용 엔티티 태그',
      },
    },
  })
  @ApiResponse({
    status: 206,
    description: '부분 콘텐츠',
    headers: {
      'Content-Range': {
        description: '반환되는 바이트 범위',
      },
      'Content-Length': {
        description: '부분 콘텐츠의 크기',
      },
    },
  })
  @ApiResponse({ status: 401, description: '미인증 - 유효하지 않은 세션' })
  @ApiResponse({ status: 403, description: '금지됨 - 요금 결제 실패' })
  @ApiResponse({ status: 404, description: '자산을 찾을 수 없음' })
  @ApiResponse({ status: 416, description: '범위를 만족할 수 없음' })
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