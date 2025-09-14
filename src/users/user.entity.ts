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
    example: 'rKGPzJNr5HgP3HPpkkm4ofE1yTv6K2eLoV'
  })
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
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
    description: '개발자 여부',
    example: false
  })
  @Column({ type: 'boolean', default: false })
  @Index('idx_users_developer')
  isDeveloper: boolean;

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

  @ApiProperty({
    description: '이 사용자가 개발자로 활성화되었는지 여부 (플랫폼 토큰 TrustSet 필요)',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  isDeveloper: boolean;
  
  @OneToMany(() => PlaySession, (session) => session.user)
  playSessions: PlaySession[];
}