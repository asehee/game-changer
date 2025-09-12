import { ApiProperty } from '@nestjs/swagger';

export class FirstChargeDto {
  @ApiProperty({
    description: '최초 충전용 임시 지갑 주소',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  })
  tempAddress: string;
}