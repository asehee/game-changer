import { ApiProperty } from '@nestjs/swagger';

export class EscrowTxDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '1'
  })
  userId: string;

  @ApiProperty({
    description: '크라우드 펀딩 ID',
    example: '1'
  })
  crowdId: string;

  @ApiProperty({
    description: '에스크로 금액',
    example: '100.00'
  })
  amount: string;
}

export class EscrowTxResponseDto {
  @ApiProperty({
    description: '처리 상태',
    example: 'success'
  })
  status: string;

  @ApiProperty({
    description: '생성된 에스크로 ID',
    example: '1'
  })
  escrowId: string;
}