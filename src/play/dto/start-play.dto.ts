import { ApiProperty } from '@nestjs/swagger';

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

export class StartPlayResponseDto {
  @ApiProperty({
    description: '플레이 세션용 JWT 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  sessionToken: string;

  @ApiProperty({
    description: '하트비트 간격(초)',
    example: 45,
  })
  heartbeatIntervalSec: number;
}

export class HeartbeatResponseDto {
  @ApiProperty({
    description: '만료 시간이 연장된 새 JWT 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  sessionToken: string;
}