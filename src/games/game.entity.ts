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
    description: 'Game unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Game title',
    example: 'Test Game'
  })
  @Column({ type: 'varchar', length: 255 })
  @Index('idx_games_title')
  title: string;

  @ApiProperty({
    description: 'Game version',
    example: '1.0.0'
  })
  @Column({ type: 'varchar', length: 50 })
  version: string;

  @ApiProperty({
    description: 'Whether the game is active and playable',
    example: true
  })
  @Column({ type: 'boolean', default: true })
  @Index('idx_games_is_active')
  isActive: boolean;

  @ApiProperty({
    description: 'Game creation timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ApiProperty({
    description: 'Game last update timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => PlaySession, (session) => session.game)
  playSessions: PlaySession[];

  @OneToMany(() => Asset, (asset) => asset.game)
  assets: Asset[];
}