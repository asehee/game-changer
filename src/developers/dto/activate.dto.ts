import { ApiProperty } from '@nestjs/swagger';

export class ActivateRequestDto {
  @ApiProperty({
    description: '서명을 생성한 사용자의 메인 지갑 주소',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  })
  walletAddress: string;
}

export class ActivateResponseDto {
  @ApiProperty({
    description: '처리 상태',
    example: 'activated',
  })
  status: string;

  @ApiProperty({
    description: '사용자에게 보여줄 성공 메시지',
    example: 'Developer status successfully activated.',
  })
  message: string;
}