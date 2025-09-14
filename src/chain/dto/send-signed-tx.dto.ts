import { ApiProperty } from '@nestjs/swagger';

export class SendSignedTxRequestDto {
    @ApiProperty({
        description: '트랜잭션의 종류',
        example: 'Payment',
    })
    txType: string;

    @ApiProperty({
        description: '서명을 생성한 사용자의 메인 지갑 주소',
        example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    })
    walletAddress: string;
    
    @ApiProperty({
        description: 'GemWallet으로부터 받은, 서명된 트랜잭션 헥스(hex) 문자열',
        example: '12000022800000002400000014614000000001234567...',
    })
    signedTransaction: string;
}

export class SendSignedTxResponseDto {
    @ApiProperty({
      description: '처리 상태',
      example: 'success',
    })
    status: string;
  
    @ApiProperty({
      description: '성공한 트랜잭션의 고유 해시',
      example: 'A4B03557295054359E6B0414DED11E051D2EE2B7619CE0E2022486A4294EAC04',
    })
    transactionHash: string;
}