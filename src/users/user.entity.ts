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
import { UserStatus } from '../common/enums/user-status.enum';
import { PlaySession } from '../play/play-session.entity';

@Entity('users')
export class User {
  @ApiProperty({
    description: '사용자 고유 식별자 (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '지갑 주소',
    example: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6'
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_users_wallet')
  wallet: string;

  @ApiProperty({
    description: '사용자 상태',
    enum: UserStatus,
    example: UserStatus.ACTIVE
  })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({
    description: '지갑 연결에서 받은 연결된 지갑 주소',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    required: false
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index('idx_users_connected_wallet')
  connectedWallet: string;

  @ApiProperty({
    description: '첫 충전용 임시 지갑 주소 (일회성)',
    example: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
    required: false
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index('idx_users_temp_wallet')
  tempWallet: string;

  @ApiProperty({
    description: '첫 충전 완료 여부',
    example: false
  })
  @Column({ type: 'boolean', default: false })
  isFirstChargeCompleted: boolean;

  @ApiProperty({
    description: '사용자 생성 시간',
    example: '2024-01-15T10:30:00.000Z'
  })
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ApiProperty({
    description: '사용자 마지막 업데이트 시간',
    example: '2024-01-15T10:30:00.000Z'
  })
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => PlaySession, (session) => session.user)
  playSessions: PlaySession[];
}