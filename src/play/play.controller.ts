import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  Query,
  Param,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { PlayService } from './play.service';
import { SessionJwtGuard } from '../auth/session-jwt.guard';
import { StartPlayDto, SessionInfoDto, CurrentSessionDto, CurrentSessionResponseDto, GetSessionResponseDto} from './dto/start-play.dto';
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
    description: '지정된 지갑 주소와 게임으로 사용자의 새 플레이 세션을 생성하고, temp wallet에서 첫 출금이 시행됨, 생성된 session에 대한 jwt token, 세션 만료시간, 하트비트 간격이 리턴됨'
  })
  @ApiResponse({
    status: 200,
    description: '세션 시작 성공',
    type: SessionInfoDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 지갑 주소 형식 또는 게임 ID' })
  @ApiResponse({ status: 403, description: '사용자 차단 또는 요금 결제 실패' })
  @ApiResponse({ status: 404, description: '게임을 찾을 수 없거나 비활성 상태' })
  async start(@Body() dto: StartPlayDto): Promise<SessionInfoDto> {
    return this.playService.startSession(dto.walletAddress, dto.gameId);
  }

  @Post('heartbeat')
  @UseGuards(SessionJwtGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @ApiBearerAuth('session-jwt')
  @ApiOperation({ 
    summary: '토큰 업데이트',
    description: 'tempWallet으로 추가결제, 업데이트된 jwt token, 관련 세션 만료시간, 하트비트 간격이 리턴됨'
  })
  @ApiResponse({
    status: 200,
    description: '하트비트 성공, 새 토큰 발급',
    type: SessionInfoDto,
  })
  @ApiResponse({ status: 401, description: '유효하지 않거나 만료된 토큰' })
  @ApiResponse({ status: 403, description: '세션 취소 또는 요금 결제 실패' })
  async heartbeat(@Req() req: any): Promise<SessionInfoDto> {
    const payload: SessionJwtPayload = req.user;
    const result = await this.playService.heartbeat(
      payload.sid,
      payload.uid,
      payload.gid,
    );
    return result;
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

  activePlayTime: number;
  @Get('current')
  @ApiOperation({ summary: '현재 지갑의 플레이 세션 조회' })
  @ApiResponse({ status: 200, description: '현재 플레이 세션 정보 반환, 없는경우 hasActiveSession은 false, sessionInfo는 null', type: CurrentSessionResponseDto})
  @ApiResponse({ status: 401, description: '유효하지 않거나 만료된 토큰' })
  async getCurrent(@Query() query: CurrentSessionDto): Promise<CurrentSessionResponseDto> {
    return this.playService.getCurrentSession(query.walletAddress);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: '세션 Id로 session repository조회하여 session 데이터 get' })
  @ApiParam({
    name: 'sessionId',
    required: true,
    description: '조회할 세션 ID'
  })
  @ApiResponse({
    status: 200,
    description: '세션 정보 조회 성공',
    type: GetSessionResponseDto
  })
  @ApiResponse({
    status: 404,
    description: '세션을 찾을 수 없음'
  })
  async getSession(
    @Param('sessionId') sessionId: string
  ): Promise<GetSessionResponseDto> {
    return this.playService.getSessionById(sessionId);
  }
}