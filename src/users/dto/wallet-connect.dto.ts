import { ApiProperty } from '@nestjs/swagger';

export class WalletConnectDto {
  @ApiProperty({
    description: '연결된 지갑 주소',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  })
  connectedAddress: string;
}