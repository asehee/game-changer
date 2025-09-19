import { ApiProperty } from '@nestjs/swagger';
import { SessionStatus,  } from '../../common/enums/session-status.enum'
import { BillingStatus } from '../../common/enums/billing-status.enum';

export class StartPlayDto {
  @ApiProperty({
    description: '지갑 주소',
    example: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
  })
  walletAddress: string;

  @ApiProperty({
    description: '플레이할 게임의 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  gameId: string;
}

//start, heatbeat의 response
export class SessionInfoDto {
  @ApiProperty({
    description: 'JWT session token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  sessionToken: string;

  @ApiProperty({
    description: 'Heartbeat interval in seconds',
    example: 30,
    minimum: 1,
  })
  heartbeatIntervalSec: number;

  @ApiProperty({
    description: 'ISO 8601 timestamp when the play expires',
    example: '2024-01-20T12:00:00Z',
    type: String,
  })
  expiresAt: string;

  @ApiProperty({
    description: 'total Cost',
    example: 1000,
  })
  totalCost: number;

  @ApiProperty({
    description: 'active play time in seconds',
    example: 63,
  })
  activePlayTime: number;
}

//CurrentSession get param
export class CurrentSessionDto {
  @ApiProperty({
    description: '지갑 주소',
    example: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
  })
  walletAddress: string;
}

export class CurrentSessionResponseDto {
  @ApiProperty({
    description: 'Indicates whether there is an active session',
    example: true,
  })
  hasActiveSession: boolean;

  @ApiProperty({
    description: 'Session information if active session exists',
    type: SessionInfoDto,
    required: false,
  })
  sessionInfo?: SessionInfoDto;
}

//session id로 session찾는 get method 응답
export class GetSessionResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({
    description: '게임 ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  gameId: string;

  @ApiProperty({
    description: '세션 상태',
    enum: SessionStatus,
    example: 'ACTIVE'
  })
  status: SessionStatus;

  @ApiProperty({
    description: '세션 만료 시간',
    example: '2024-01-20T12:00:00Z'
  })
  expiresAt: string;

  @ApiProperty({
    description: '마지막 하트비트 시간',
    example: '2024-01-20T11:00:00Z'
  })
  lastHeartbeatAt: string;

  @ApiProperty({
    description: '개발자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  developerId: string;

  @ApiProperty({
    description: '빌링 상태',
    enum: BillingStatus,
    example: 'OK'
  })
  billingStatus: BillingStatus;

  @ApiProperty({ 
    description: '게임 플레 이타임 [초]', 
    example: 10
  })
  activePlayTime: number;

  @ApiProperty({
    description: '누적 지불 금액', 
    example: 6
  })
  totalCost: number;
}
