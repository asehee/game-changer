import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CrowdFunding } from './crowd-funding.entity';
import { Escrow } from './escrow.entity';
import { Game } from '../games/game.entity';
import { User } from '../users/user.entity';
import { CrowdFundingListDto } from './dto/crowd-funding-list.dto';
import { CrowdFundingDetailDto } from './dto/crowd-funding-detail.dto';

@Injectable()
export class CrowdFundingService {
  private readonly logger = new Logger(CrowdFundingService.name);

  constructor(
    @InjectRepository(CrowdFunding)
    private readonly crowdFundingRepository: Repository<CrowdFunding>,
    @InjectRepository(Escrow)
    private readonly escrowRepository: Repository<Escrow>,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async getCrowdFundingList(): Promise<CrowdFundingListDto[]> {
    const crowdFundings = await this.crowdFundingRepository
      .createQueryBuilder('cf')
      .leftJoinAndSelect('cf.escrows', 'escrow')
      .orderBy('cf.createdAt', 'DESC')
      .getMany();

    const result: CrowdFundingListDto[] = [];

    for (const cf of crowdFundings) {
      // 게임 정보 조회
      const game = await this.gameRepository.findOne({
        where: { id: cf.gameId }
      });

      // 현재 펀딩 금액 계산
      const escrows = await this.escrowRepository.find({
        where: { crowdId: cf.id }
      });

      const currentAmount = escrows.reduce((sum, escrow) => {
        return sum + parseFloat(escrow.amount);
      }, 0);

      // 펀딩 진행률 계산 (0-100)
      const fundingProgress = Math.min(
        (currentAmount / parseFloat(cf.goalAmount)) * 100,
        100
      );

      // 참여자 수 계산 (unique userId)
      const uniqueUserIds = new Set(escrows.map(e => e.userId));
      const participantCount = uniqueUserIds.size;

      // 가장 최근 투표 상태 (해당 유저의 최신 투표)
      // 여기서는 임시로 abstain으로 설정 (실제로는 현재 로그인 유저의 투표 상태를 조회해야 함)
      const voteStatus = 'abstain' as any;

      result.push({
        id: cf.id,
        gameName: game?.title || 'Unknown Game',
        fundingProgress: Math.round(fundingProgress * 100) / 100,
        participantCount,
        voteStatus,
        fundingStatus: cf.status,
        goalAmount: cf.goalAmount,
        currentAmount: currentAmount.toString(),
        startDate: cf.startDate.toISOString(),
        endDate: cf.endDate.toISOString(),
      });
    }

    return result;
  }

  async getCrowdFundingDetail(crowdId: string): Promise<CrowdFundingDetailDto> {
    // 크라우드 펀딩 조회
    const crowdFunding = await this.crowdFundingRepository.findOne({
      where: { id: crowdId }
    });

    if (!crowdFunding) {
      throw new NotFoundException('Crowd funding not found');
    }

    // 개발자 정보 조회
    const developer = await this.userRepository.findOne({
      where: { id: crowdFunding.developerId }
    });

    if (!developer) {
      throw new NotFoundException('Developer not found');
    }

    // 환경변수에서 CONDITION 값 가져오기
    const condition = this.configService.get<string>('CONDITION');

    return {
      wallet: developer.wallet,
      startDate: crowdFunding.startDate.toISOString(),
      endDate: crowdFunding.endDate.toISOString(),
      condition: condition,
    };
  }
}