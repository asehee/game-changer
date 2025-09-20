import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CrowdFunding } from './crowd-funding.entity';

export enum VoteStatus {
  AGREE = 'agree',
  DISAGREE = 'disagree',
  ABSTAIN = 'abstain'
}

@Entity('escrow')
export class Escrow {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'bigint', unsigned: true })
  userId: string;

  @Column({ type: 'bigint', unsigned: true })
  crowdId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: string;

  @Column({ type: 'int', unsigned: true, default: 1 })
  sequence: number;

  @Column({
    type: 'enum',
    enum: VoteStatus,
    default: VoteStatus.ABSTAIN
  })
  voteStatus: VoteStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => CrowdFunding)
  @JoinColumn({ name: 'crowdId' })
  crowdFunding: CrowdFunding;
}