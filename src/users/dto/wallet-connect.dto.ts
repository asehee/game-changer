import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class WalletConnectDto {
  @ApiProperty({
    description: 'Connected wallet address',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  })
  @IsString()
  @IsNotEmpty()
  connectedAddress: string;
}