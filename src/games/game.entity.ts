import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { PlaySession } from '../play/play-session.entity';
import { Asset } from '../assets/asset.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @Index('idx_games_title')
  title: string;

  @Column({ type: 'text' })
  version: string;

  @Column({ type: 'boolean', default: true })
  @Index('idx_games_is_active')
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => PlaySession, (session) => session.game)
  playSessions: PlaySession[];

  @OneToMany(() => Asset, (asset) => asset.game)
  assets: Asset[];
}