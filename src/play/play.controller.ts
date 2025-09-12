import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlayService } from './play.service';
import { SessionJwtGuard } from '../auth/session-jwt.guard';
import { StartPlayDto, StartPlayResponseDto, HeartbeatResponseDto } from './dto/start-play.dto';
import { SessionJwtPayload } from '../auth/session-jwt.strategy';
import { Throttle } from '@nestjs/throttler';

@ApiTags('플레이')
@Controller('api/play')
export class PlayController {
  constructor(private readonly playService: PlayService) {}

  @Post('start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '새 플레이 세션 시작',
    description: '지정된 지갑 주소와 게임으로 사용자의 새 플레이 세션을 생성합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '세션 시작 성공',
    type: StartPlayResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 지갑 주소 형식 또는 게임 ID' })
  @ApiResponse({ status: 403, description: '사용자 차단 또는 요금 결제 실패' })
  @ApiResponse({ status: 404, description: '게임을 찾을 수 없거나 비활성 상태' })
  async start(@Body() dto: StartPlayDto): Promise<StartPlayResponseDto> {
    return this.playService.startSession(dto.walletAddress, dto.gameId);
  }

  @Post('heartbeat')
  @UseGuards(SessionJwtGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @ApiBearerAuth('session-jwt')
  @ApiOperation({ summary: '세션 유지를 위한 하트비트 전송' })
  @ApiResponse({
    status: 200,
    description: '하트비트 성공, 새 토큰 발급',
    type: HeartbeatResponseDto,
  })
  @ApiResponse({ status: 401, description: '유효하지 않거나 만료된 토큰' })
  @ApiResponse({ status: 403, description: '세션 취소 또는 요금 결제 실패' })
  async heartbeat(@Req() req: any): Promise<HeartbeatResponseDto> {
    const payload: SessionJwtPayload = req.user;
    const newToken = await this.playService.heartbeat(
      payload.sid,
      payload.uid,
      payload.gid,
    );
    return { sessionToken: newToken };
  }

  @Post('stop')
  @UseGuards(SessionJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('session-jwt')
  @ApiOperation({ summary: '현재 플레이 세션 중지' })
  @ApiResponse({ status: 204, description: '세션 중지 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않거나 만료된 토큰' })
  async stop(@Req() req: any): Promise<void> {
    const payload: SessionJwtPayload = req.user;
    await this.playService.stopSession(payload.sid, payload.uid);
  }
}