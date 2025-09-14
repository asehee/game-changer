import { ApiProperty } from '@nestjs/swagger';

export class RewardRequestDto {
    @ApiProperty({
      description: '보상을 받을 사용자의 지갑 주소',
      example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    })
    walletAddress: string;
}

export class RewardResponseDto {
    @ApiProperty({ description: '처리 상태', example: 'success' })
    status: string;
  
    @ApiProperty({ description: '전송된 XRP 양', example: '0.1' })
    amount: string;
  
    @ApiProperty({
      description: '성공한 트랜잭션의 고유 해시',
      example: 'A4B03557295054359E6B0414DED11E051D2EE2B7619CE0E2022486A4294EAC04',
    })
    transactionHash: string;
  }