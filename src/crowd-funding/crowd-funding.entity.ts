import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CrowdFundingStatus {
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished'
}

@Entity('crowd_funding')
export class CrowdFunding {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'bigint', unsigned: true })
  gameId: string;

  @Column({ type: 'bigint', unsigned: true })
  developerId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  goalAmount: string;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: CrowdFundingStatus,
    default: CrowdFundingStatus.IN_PROGRESS
  })
  status: CrowdFundingStatus;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  isGoalReached: boolean;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  isVoteSuccess: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}