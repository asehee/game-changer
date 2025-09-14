import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { Game } from '../games/game.entity';

@Entity('developer_stats')
@Index('idx_developer_stats_date', ['developerId', 'gameId', 'date'], { unique: true })
export class DeveloperStats {
  @ApiProperty({
    description: '통계 고유 식별자',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '개발자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @Column({ type: 'uuid' })
  developerId: string;

  @ApiProperty({
    description: '게임 ID (전체 통계인 경우 null)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false
  })
  @Column({ type: 'uuid', nullable: true })
  gameId: string;

  @ApiProperty({
    description: '통계 날짜',
    example: '2024-01-15'
  })
  @Column({ type: 'date' })
  @Index('idx_developer_stats_date_only')
  date: Date;

  @ApiProperty({
    description: '일일 수익',
    example: 123.456789
  })
  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  dailyRevenue: number;

  @ApiProperty({
    description: '일일 세션 수',
    example: 45
  })
  @Column({ type: 'int', default: 0 })
  dailySessions: number;

  @ApiProperty({
    description: '일일 플레이어 수',
    example: 32
  })
  @Column({ type: 'int', default: 0 })
  dailyPlayers: number;

  @ApiProperty({
    description: '일일 총 플레이 시간 (초)',
    example: 12345
  })
  @Column({ type: 'int', default: 0 })
  dailyPlayTime: number;

  @ApiProperty({
    description: '생성 시간',
    example: '2024-01-15T10:30:00.000Z'
  })
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ApiProperty({
    description: '업데이트 시간',
    example: '2024-01-15T10:30:00.000Z'
  })
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'developerId' })
  developer: User;

  @ManyToOne(() => Game)
  @JoinColumn({ name: 'gameId' })
  game: Game;
}