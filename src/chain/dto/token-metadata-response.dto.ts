import { ApiProperty } from '@nestjs/swagger';

export class TokenMetadataResponseDto {
  @ApiProperty({
    description: 'The issuer address of the token',
    example: 'PORTrJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a',
  })
  issuer_address: string;

  @ApiProperty({
    description: 'The currency code of the token',
    example: 'USD',
  })
  token_currency_code: string;

  @ApiProperty({
    description: 'The testnet WebSocket URL',
    example: 'wss://s.altnet.rippletest.net:51233',
  })
  testnet: string;

  @ApiProperty({
    description: 'The server wallet address',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  })
  server_address: string;
}