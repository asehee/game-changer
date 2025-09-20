import { ApiProperty } from '@nestjs/swagger';

export class CrowdFundingDetailDto {
  @ApiProperty({
    description: '개발자 지갑 주소',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
  })
  wallet: string;

  @ApiProperty({
    description: '펀딩 시작일',
    example: '2024-01-01T00:00:00.000Z'
  })
  startDate: string;

  @ApiProperty({
    description: '펀딩 종료일',
    example: '2024-12-31T23:59:59.000Z'
  })
  endDate: string;

  @ApiProperty({
    description: '조건 값',
    example: 'A02580208D65C1BB9745DDD942C7D91780E1763AACDA6C25B28BF7ED00DB9C7A20833B95810120'
  })
  condition: string;
}