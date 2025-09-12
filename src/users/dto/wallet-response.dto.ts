import { ApiProperty } from '@nestjs/swagger';

export class WalletResponseDto {
  @ApiProperty({
    description: '작업 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '수신한 지갑 주소',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  })
  received: string;
}