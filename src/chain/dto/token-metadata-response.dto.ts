import { ApiProperty } from '@nestjs/swagger';

export class TokenMetadataResponseDto {
  @ApiProperty({
    description: '토큰 발행자 주소',
    example: 'rJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a',
  })
  issuer_address: string;

  @ApiProperty({
    description: '토큰 통화 코드',
    example: 'USD',
  })
  token_currency_code: string;

  @ApiProperty({
    description: '테스트넷 WebSocket URL',
    example: 'wss://s.altnet.rippletest.net:51233',
  })
  testnet: string;

  @ApiProperty({
    description: '서버 지갑 주소',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  })
  server_address: string;
}