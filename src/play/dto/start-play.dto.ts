import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartPlayDto {
  @ApiProperty({
    description: 'The ID of the game to start playing',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  gameId: string;
}

export class StartPlayResponseDto {
  @ApiProperty({
    description: 'JWT token for the play session',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  sessionToken: string;

  @ApiProperty({
    description: 'Heartbeat interval in seconds',
    example: 45,
  })
  heartbeatIntervalSec: number;
}

export class HeartbeatResponseDto {
  @ApiProperty({
    description: 'New JWT token with extended expiration',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  sessionToken: string;
}