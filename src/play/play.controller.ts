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

@ApiTags('play')
@Controller('api/play')
export class PlayController {
  constructor(private readonly playService: PlayService) {}

  @Post('start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Start a new play session',
    description: 'Creates a new play session for the user with the specified wallet address and game.'
  })
  @ApiResponse({
    status: 200,
    description: 'Session started successfully',
    type: StartPlayResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid wallet address format or game ID' })
  @ApiResponse({ status: 403, description: 'User blocked or billing failed' })
  @ApiResponse({ status: 404, description: 'Game not found or inactive' })
  async start(@Body() dto: StartPlayDto): Promise<StartPlayResponseDto> {
    return this.playService.startSession(dto.walletAddress, dto.gameId);
  }

  @Post('heartbeat')
  @UseGuards(SessionJwtGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @ApiBearerAuth('session-jwt')
  @ApiOperation({ summary: 'Send heartbeat to maintain session' })
  @ApiResponse({
    status: 200,
    description: 'Heartbeat successful, new token issued',
    type: HeartbeatResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  @ApiResponse({ status: 403, description: 'Session revoked or billing failed' })
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
  @ApiOperation({ summary: 'Stop the current play session' })
  @ApiResponse({ status: 204, description: 'Session stopped successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async stop(@Req() req: any): Promise<void> {
    const payload: SessionJwtPayload = req.user;
    await this.playService.stopSession(payload.sid, payload.uid);
  }
}