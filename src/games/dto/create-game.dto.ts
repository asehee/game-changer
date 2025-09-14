import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';

export class CreateGameDto {
  @ApiProperty({
    description: '게임 제목',
    example: 'Cyber Warriors',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '게임 설명',
    example: 'Epic cyberpunk battle royale with stunning graphics',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '게임 장르',
    example: 'action',
    enum: ['action', 'adventure', 'strategy', 'simulation', 'rpg', 'puzzle', 'sports', 'racing', 'horror', 'casual'],
  })
  @IsEnum(['action', 'adventure', 'strategy', 'simulation', 'rpg', 'puzzle', 'sports', 'racing', 'horror', 'casual'])
  genre: string;

  @ApiProperty({
    description: '게임 썸네일 이미지 URL',
    example: '/assets/game_images/shooting1.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({
    description: '게임 실행 URL',
    example: 'http://localhost:9999',
    required: false,
  })
  @IsString()
  @IsOptional()
  gameUrl?: string;

  @ApiProperty({
    description: '외부 게임 여부 (iframe으로 로드)',
    example: true,
    required: false,
  })
  @IsOptional()
  isExternal?: boolean;

  @ApiProperty({
    description: '시간당 가격 (USD)',
    example: 0.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiProperty({
    description: '할인율 (%)',
    example: 20,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discount?: number;

  @ApiProperty({
    description: '게임 버전',
    example: '1.0.0',
  })
  @IsString()
  version: string;

  @ApiProperty({ 
    description: '게임 개발자 지갑 주소', 
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
  })
  @IsString()
  developerAddress: string;

  @ApiProperty({
    description: '총 플레이어 수',
    example: 15234,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  playerCount?: number;

  @ApiProperty({
    description: '총 플레이 시간 (시간 단위)',
    example: 125000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  totalPlayTime?: number;

  @ApiProperty({
    description: '게임 평점 (0-5)',
    example: 4.8,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({
    description: '플레이 시간당 개발자에게 지급될 토큰(LUSD)의 양',
    example: 360.5,
  })
  @IsNumber()
  ratePerSession: number;
}