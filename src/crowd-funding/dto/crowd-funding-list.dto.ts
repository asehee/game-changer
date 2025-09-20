import { ApiProperty } from '@nestjs/swagger';
import { CrowdFundingStatus } from '../crowd-funding.entity';
import { VoteStatus } from '../escrow.entity';

export class CrowdFundingListDto {
  @ApiProperty({
    description: '크라우드 펀딩 ID',
    example: '1'
  })
  id: string;

  @ApiProperty({
    description: '게임명',
    example: 'Super Game 2024'
  })
  gameName: string;

  @ApiProperty({
    description: '펀딩 진행률 (0-100%)',
    example: 75.5
  })
  fundingProgress: number;

  @ApiProperty({
    description: '참여자 수',
    example: 42
  })
  participantCount: number;

  @ApiProperty({
    description: '투표 상태',
    enum: VoteStatus,
    example: VoteStatus.AGREE
  })
  voteStatus: VoteStatus;

  @ApiProperty({
    description: '펀딩 상태',
    enum: CrowdFundingStatus,
    example: CrowdFundingStatus.IN_PROGRESS
  })
  fundingStatus: CrowdFundingStatus;

  @ApiProperty({
    description: '목표 금액',
    example: '10000.00'
  })
  goalAmount: string;

  @ApiProperty({
    description: '현재 모금된 금액',
    example: '7550.00'
  })
  currentAmount: string;

  @ApiProperty({
    description: '펀딩 시작일',
    example: '2024-01-01T00:00:00.000Z'
  })
  startDate: string;

  @ApiProperty({
    description: '펀딩 종료일',
    example: '2024-12-31T23:59:59.000Z'
  })
  endDate: string;
}