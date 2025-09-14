import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PlaySession } from '../play/play-session.entity';
import { Asset } from '../assets/asset.entity';

@Entity('games')
export class Game {
  @ApiProperty({
    description: '게임 고유 식별자 (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '게임 제목',
    example: 'Cyber Warriors'
  })
  @Column({ type: 'varchar', length: 255 })
  @Index('idx_games_title')
  title: string;

  @ApiProperty({
    description: '게임 설명',
    example: 'Epic cyberpunk battle royale with stunning graphics'
  })
  @Column({ type: 'text', nullable: true, default: null })
  description: string;

  @ApiProperty({
    description: '게임 장르',
    example: 'action',
    enum: ['action', 'adventure', 'strategy', 'simulation', 'rpg', 'puzzle', 'sports', 'racing', 'horror', 'casual']
  })
  @Column({ type: 'varchar', length: 50, default: 'casual' })
  @Index('idx_games_genre')
  genre: string;

  @ApiProperty({
    description: '게임 썸네일 이미지 URL',
    example: '/assets/game_images/shooting1.png'
  })
  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  thumbnail: string;

  @ApiProperty({
    description: '게임 실행 URL',
    example: 'http://localhost:9999'
  })
  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  gameUrl: string;

  @ApiProperty({
    description: '외부 게임 여부 (iframe으로 로드)',
    example: true
  })
  @Column({ type: 'boolean', default: true })
  isExternal: boolean;

  @ApiProperty({
    description: '총 플레이어 수',
    example: 15234
  })
  @Column({ type: 'int', default: 0 })
  playerCount: number;

  @ApiProperty({
    description: '총 플레이 시간 (시간 단위)',
    example: 125000
  })
  @Column({ type: 'bigint', default: 0 })
  totalPlayTime: number;

  @ApiProperty({
    description: '게임 평점 (0-5)',
    example: 4.8
  })
  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0.0 })
  rating: number;

  @ApiProperty({
    description: '시간당 가격 (USD)',
    example: 0.5
  })
  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0.0 })
  price: number;

  @ApiProperty({
    description: '초당 가격 (USD)',
    example: 0.00000001
  })
  @Column({ type: 'decimal', precision: 10, scale: 8, default: 0.00000001 })
  pricePerSecond: number;

  @ApiProperty({
    description: '총 세션 수',
    example: 1520
  })
  @Column({ type: 'int', default: 0 })
  totalSessions: number;

  @ApiProperty({
    description: '게임 승인 상태',
    example: 'APPROVED'
  })
  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  })
  @Index('idx_games_approval')
  approvalStatus: string;

  @ApiProperty({
    description: '할인율 (%)',
    example: 20
  })
  @Column({ type: 'int', default: 0 })
  discount: number;

  @ApiProperty({
    description: '게임 버전',
    example: '1.0.0'
  })
  @Column({ type: 'varchar', length: 50 })
  version: string;

  @ApiProperty({
    description: '게임이 활성 상태이고 플레이 가능한지 여부',
    example: true
  })
  @Column({ type: 'boolean', default: true })
  @Index('idx_games_is_active')
  isActive: boolean;

  @ApiProperty({
    description: '게임 개발자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @Column({ type: 'varchar', length: 36 })
  @Index('idx_games_developer')
  developerId: string;

  @ApiProperty({
    description: '게임 생성 시간',
    example: '2024-01-15T10:30:00.000Z'
  })
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ApiProperty({
    description: '게임 마지막 업데이트 시간',
    example: '2024-01-15T10:30:00.000Z'
  })
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  // 시간당 수익률 컬럼 추가
  @ApiProperty({
    description: '플레이 시간당 개발자에게 지급될 토큰(LUSD)의 양',
    example: '360' // 예: 시간당 360 LUSD
  })
  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0.0 })
  ratePerSession: number;

  @OneToMany(() => PlaySession, (session) => session.game)
  playSessions: PlaySession[];

  @OneToMany(() => Asset, (asset) => asset.game)
  assets: Asset[];
}