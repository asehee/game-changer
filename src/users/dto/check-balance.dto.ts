import { ApiProperty } from '@nestjs/swagger';

class tokenBalanceDto {
  @ApiProperty({ description: '토큰의 가치', example: '100' })
  value: string;

  @ApiProperty({ description: '토큰의 통화 코드', example: 'USD' })
  currency: string;

  @ApiProperty({ description: '토큰 발행자 주소', example: 'rJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a' })
  issuer: string;
}

export class BalanceRequestDto {
  @ApiProperty({
    description: '잔액을 조회할 사용자의 메인 지갑 주소',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  })
  walletAddress: string;
}

export class BalanceResponseDto {
  @ApiProperty({ description: '조회된 임시 지갑 주소', example: 'rw19puaVfXPeEBgAMFyV37UvhDQNG5XWyN' })
  tempWalletAddress: string;

  @ApiProperty({ description: 'XRP 잔액', example: '1.201' })
  xrpBalance: string;
  
  @ApiProperty({ description: 'IOU 토큰 잔액' })
  tokenBalance: tokenBalanceDto;
}

