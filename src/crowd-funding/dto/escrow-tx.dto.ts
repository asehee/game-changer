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

  @ApiProperty({
    description: '서명된 트랜잭션',
    example: '1200002280000000240000000061400000000000000068400000000000000A73210331E93628A08C2A016103020FA8E5BC1EB00B71EEB1DAA6E4D8414B8A0D15EC7FE744630440220132E204676D40EA69D18D95BB1D956312DCA8E09F2F76E37FDEC037F70E40959C5022007FE97FFBFB7B5D7EE6DACCA0BA42EEC45BC76C1C3D4F9D9F93F1B8F8CF1B79681146B6EBE9DEF5DF3C9B2E4F9E8D7A5B6C4E3F2A1831146B6EBE9DEF5DF3C9B2E4F9E8D7A5B6C4E3F2A1'
  })
  signedTx: string;
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

export class CreateEscrowTxDto {
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