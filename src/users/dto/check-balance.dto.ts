import { ApiProperty } from '@nestjs/swagger';

export class BalanceRequestDto {
  @ApiProperty({
    description: '사용자의 메인 지갑 주소 (실제 잔액은 temp지갑의 잔액을 조회함)',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  })
  walletAddress: string;
}

export class BalanceResponseDto {
  @ApiProperty({ 
    description: '조회된 임시 지갑 주소', 
    example: 'rw19puaVfXPeEBgAMFyV37UvhDQNG5XWyN'
  })
  tempWallet: string | null;

  @ApiProperty({ 
    description: 'XRP 잔액',
    example: '1.201'
  })
  xrpBalance: string;
  
  @ApiProperty({ 
    description: 'IOU 토큰 잔액',
    example: '1.201'
  })
  tokenBalance: string;
}

