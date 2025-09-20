import { ApiProperty } from '@nestjs/swagger';

export class BatchFinishRequestDto {
  @ApiProperty({
    description: '크라우드 펀딩 ID',
    example: '1'
  })
  crowdId: string;
}

export class BatchFinishResponseDto {
  @ApiProperty({
    description: '처리 상태',
    example: 'success'
  })
  status: string;

  @ApiProperty({
    description: 'batch tx hash (escrow finish)',
    example: 'FB0EB213A03DD375EF2C556118E7EC7FFE850FC427867B9BF221A6E5BE2011E6'
  })
  batchTx: string;
}

export class BatchCancelRequestDto {
  @ApiProperty({
    description: '크라우드 펀딩 ID',
    example: '1'
  })
  crowdId: string;
}

export class BatchCancelResponseDto {
  @ApiProperty({
    description: '처리 상태',
    example: 'success'
  })
  status: string;

  @ApiProperty({
    description: 'batch tx hash (escrow cancel)',
    example: 'FB0EB213A03DD375EF2C556118E7EC7FFE850FC427867B9BF221A6E5BE2011E6'
  })
  batchTx: string;
}