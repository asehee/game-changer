import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty({
    description: '게임 제목',
    example: 'Test Game',
  })
  title: string;

  @ApiProperty({
    description: '게임 버전',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({ 
    description: '게임 개발자 지갑 주소', 
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
  })
  developerAddress: string;

  @ApiProperty({
    description: '플레이 시간당 개발자에게 지급될 토큰(LUSD)의 양',
    example: 360.5,
  })
  ratePerSession: number;
}