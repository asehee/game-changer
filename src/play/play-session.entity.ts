import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SessionStatus } from '../common/enums/session-status.enum';
import { BillingStatus } from '../common/enums/billing-status.enum';
import { User } from '../users/user.entity';
import { Game } from '../games/game.entity';

@Entity('play_sessions')
@Index('idx_play_sessions_user_game', ['userId', 'gameId'])
@Index('idx_play_sessions_status_expires', ['status', 'expiresAt'])
export class PlaySession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  gameId: string;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  @Index('idx_play_sessions_status')
  status: SessionStatus;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastHeartbeatAt: Date;

  @Column({ type: 'int', default: 0 })
  tokenRenewalCount: number;

  @Column({
    type: 'enum',
    enum: BillingStatus,
    default: BillingStatus.UNKNOWN,
  })
  billingStatus: BillingStatus;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.playSessions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Game, (game) => game.playSessions)
  @JoinColumn({ name: 'gameId' })
  game: Game;
}