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

  @Column({ type: 'varchar', length: 500 })
  path: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  etag: string;

  @Column({ type: 'bigint' })
  size: string;

  @Column({ type: 'varchar', length: 100 })
  mime: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ManyToOne(() => Game, (game) => game.assets)
  @JoinColumn({ name: 'gameId' })
  game: Game;
}