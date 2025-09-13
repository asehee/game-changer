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
    description: '게임 활성 상태',
    example: true,
    default: true,
  })
  isActive?: boolean;

  @ApiProperty({ 
    description: '게임 개발자 지갑 주소', 
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
  })
  developerAddress: string;
}