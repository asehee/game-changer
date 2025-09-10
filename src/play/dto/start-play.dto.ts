import { IsUUID, IsNotEmpty, IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartPlayDto {
  @ApiProperty({
    description: 'Ethereum wallet address',
    example: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
  })
  @IsString()
  @IsNotEmpty()
  @Length(42, 42, { message: 'Wallet address must be 42 characters long' })
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid wallet address format' })
  walletAddress: string;

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