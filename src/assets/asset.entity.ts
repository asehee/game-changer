import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Game } from '../games/game.entity';

@Entity('assets')
@Index('idx_assets_game_path', ['gameId', 'path'])
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  gameId: string;

  @Column({ type: 'text' })
  path: string;

  @Column({ type: 'text', nullable: true })
  etag: string;

  @Column({ type: 'bigint' })
  size: string;

  @Column({ type: 'text' })
  mime: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ManyToOne(() => Game, (game) => game.assets)
  @JoinColumn({ name: 'gameId' })
  game: Game;
}