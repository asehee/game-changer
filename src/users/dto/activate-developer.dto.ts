import { ApiProperty } from '@nestjs/swagger';

export class ActivateDeveloperRequestDto {
  @ApiProperty({
    description: '개발자 활성화를 확인할 주소',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  })
  walletAddress: string;
}

export class ActivateDeveloperResponseDto {
  @ApiProperty({ 
    description: '활성화 상태', 
    example: 'pending_trustline',
    enum: ['already_active', 'activated', 'pending_trustline']
  })
  status: string;

  @ApiProperty({ 
    description: '사용자에게 보여줄 메시지', 
    example: 'Please sign the transaction to set the trustline.'
  })
  message: string;

  @ApiProperty({ 
    description: '서명이 필요한 TrustSet 트랜잭션 객체 (필요 시)',
    required: false 
  })
  transaction?: object;
}