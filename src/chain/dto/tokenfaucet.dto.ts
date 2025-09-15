import { ApiProperty } from '@nestjs/swagger';

export class TokenFaucetDto {
  @ApiProperty({
    description: '연결된 지갑 주소',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  })
  walletAddress: string;
}