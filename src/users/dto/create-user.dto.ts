import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Wallet address (Ethereum format)',
    example: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
  })
  @IsString()
  @IsNotEmpty()
  @Length(42, 42, { message: 'Wallet address must be 42 characters long' })
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid wallet address format' })
  walletAddress: string;
}