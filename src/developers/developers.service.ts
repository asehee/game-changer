import { Injectable, NotFoundException, ForbiddenException, ServiceUnavailableException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DeveloperStats } from './developer-stats.entity';
import { User } from '../users/user.entity';
import { Game } from '../games/game.entity';
import { ActivateResponseDto } from './dto/activate.dto';
import { PlaySession } from '../play/play-session.entity';
import * as xrpl from 'xrpl';

@Injectable()
export class DevelopersService {
  private readonly logger = new Logger(DevelopersService.name);
  private readonly xrplClient: xrpl.Client; // XRPL 클라이언트 인스턴스
  private readonly issuerAddress: string;
  private readonly currencyCode: string;

  constructor(
    @InjectRepository(DeveloperStats)
    private developerStatsRepository: Repository<DeveloperStats>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(PlaySession)
    private playSessionRepository: Repository<PlaySession>,
    private readonly configService: ConfigService,
  ) {
    this.issuerAddress = this.configService.get<string>('ISSUER_ADDRESS', 'rJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a');
    this.currencyCode = this.configService.get<string>('TOKEN_CURRENCY_CODE', 'USD');
    this.xrplClient = new xrpl.Client(this.configService.get<string>('TESTNET', 'wss://s.altnet.rippletest.net:51233'));
    this.xrplClient.connect().then(() => { this.logger.log('XRPL Client connected successfully.');});
  }

  async getDeveloperDashboard(walletAddress: string) {
    // 개발자 조회
    const developer = await this.userRepository.findOne({
      where: { wallet: walletAddress, isDeveloper: true }
    });

    if (!developer) {
      throw new Error('Developer not found');
    }

    // 개발자 게임 목록
    const games = await this.gameRepository.find({
      where: { developerId: developer.id },
      order: { createdAt: 'DESC' }
    });

    // 총 통계 계산
    const totalStats = await this.calculateTotalStats(developer.id);
    
    // 오늘 통계
    const todayStats = await this.getTodayStats(developer.id);
    
    // 최근 세션들
    const recentSessions = await this.getRecentSessions(developer.id);

    return {
      developer: {
        id: developer.id,
        wallet: developer.wallet,
        isDeveloper: developer.isDeveloper,
      },
      overview: {
        totalRevenue: totalStats.totalRevenue,
        todayRevenue: todayStats.todayRevenue,
        totalGames: games.length,
        activeGames: games.filter(g => g.isActive).length,
        totalPlayers: totalStats.totalPlayers,
        totalSessions: totalStats.totalSessions,
        totalPlayTime: totalStats.totalPlayTime,
      },
      games: games.map(game => ({
        id: game.id,
        title: game.title,
        status: game.isActive ? 'active' : 'inactive',
        approvalStatus: game.approvalStatus,
        playerCount: game.playerCount,
        totalSessions: game.totalSessions,
        pricePerSecond: game.pricePerSecond,
        rating: game.rating,
        createdAt: game.createdAt,
      })),
      recentSessions: recentSessions,
    };
  }

  private async calculateTotalStats(developerId: string) {
    const result = await this.playSessionRepository
      .createQueryBuilder('ps')
      .select([
        'COALESCE(SUM(ps.totalCost), 0) as totalRevenue',
        'COUNT(DISTINCT ps.userId) as totalPlayers',
        'COUNT(ps.id) as totalSessions',
        'COALESCE(SUM(ps.activePlayTime), 0) as totalPlayTime',
      ])
      .where('ps.developerId = :developerId', { developerId })
      .andWhere('ps.status = :status', { status: 'COMPLETED' })
      .getRawOne();

    return {
      totalRevenue: parseFloat(result.totalRevenue) || 0,
      totalPlayers: parseInt(result.totalPlayers) || 0,
      totalSessions: parseInt(result.totalSessions) || 0,
      totalPlayTime: parseInt(result.totalPlayTime) || 0,
    };
  }

  private async getTodayStats(developerId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.playSessionRepository
      .createQueryBuilder('ps')
      .select(['COALESCE(SUM(ps.totalCost), 0) as todayRevenue'])
      .where('ps.developerId = :developerId', { developerId })
      .andWhere('ps.createdAt >= :today', { today })
      .andWhere('ps.status = :status', { status: 'COMPLETED' })
      .getRawOne();

    return {
      todayRevenue: parseFloat(result.todayRevenue) || 0,
    };
  }

  private async getRecentSessions(developerId: string) {
    const sessions = await this.playSessionRepository.find({
      where: { developerId },
      relations: ['user', 'game'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return sessions.map(session => ({
      id: session.id,
      gameTitle: session.game?.title || 'Unknown',
      userWallet: session.user?.wallet || 'Unknown',
      activePlayTime: session.activePlayTime,
      totalCost: session.totalCost,
      status: session.status,
      createdAt: session.createdAt,
      endedAt: session.endedAt,
    }));
  }

  async getGameAnalytics(gameId: string, walletAddress: string) {
    // 게임이 개발자 소유인지 확인
    const developer = await this.userRepository.findOne({
      where: { wallet: walletAddress, isDeveloper: true }
    });

    if (!developer) {
      throw new Error('Developer not found');
    }

    const game = await this.gameRepository.findOne({
      where: { id: gameId, developerId: developer.id }
    });

    if (!game) {
      throw new Error('Game not found or not owned by developer');
    }

    // 게임 세션 통계
    const sessionStats = await this.playSessionRepository
      .createQueryBuilder('ps')
      .select([
        'COALESCE(SUM(ps.totalCost), 0) as totalRevenue',
        'COUNT(ps.id) as totalSessions',
        'COUNT(DISTINCT ps.userId) as uniquePlayers',
        'COALESCE(AVG(ps.activePlayTime), 0) as avgPlayTime',
        'COALESCE(SUM(ps.activePlayTime), 0) as totalPlayTime',
      ])
      .where('ps.gameId = :gameId', { gameId })
      .andWhere('ps.status = :status', { status: 'COMPLETED' })
      .getRawOne();

    // 일별 통계 (최근 30일)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await this.playSessionRepository
      .createQueryBuilder('ps')
      .select([
        'DATE(ps.createdAt) as date',
        'COALESCE(SUM(ps.totalCost), 0) as revenue',
        'COUNT(ps.id) as sessions',
        'COUNT(DISTINCT ps.userId) as players',
        'COALESCE(AVG(ps.activePlayTime), 0) as avgPlayTime',
      ])
      .where('ps.gameId = :gameId', { gameId })
      .andWhere('ps.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
      .andWhere('ps.status = :status', { status: 'COMPLETED' })
      .groupBy('DATE(ps.createdAt)')
      .orderBy('date', 'DESC')
      .getRawMany();

    return {
      game: {
        id: game.id,
        title: game.title,
        description: game.description,
        pricePerSecond: game.pricePerSecond,
        rating: game.rating,
        isActive: game.isActive,
        createdAt: game.createdAt,
      },
      overview: {
        totalRevenue: parseFloat(sessionStats.totalRevenue) || 0,
        totalSessions: parseInt(sessionStats.totalSessions) || 0,
        uniquePlayers: parseInt(sessionStats.uniquePlayers) || 0,
        avgPlayTime: parseFloat(sessionStats.avgPlayTime) || 0,
        totalPlayTime: parseInt(sessionStats.totalPlayTime) || 0,
      },
      dailyStats: dailyStats.map(stat => ({
        date: stat.date,
        revenue: parseFloat(stat.revenue) || 0,
        sessions: parseInt(stat.sessions) || 0,
        players: parseInt(stat.players) || 0,
        avgPlayTime: parseFloat(stat.avgPlayTime) || 0,
      })),
    };
  }

  async updateDeveloperStatus(walletAddress: string, isDeveloper: boolean) {
    const user = await this.userRepository.findOne({
      where: { wallet: walletAddress }
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.isDeveloper = isDeveloper;
    await this.userRepository.save(user);

    return user;
  }

  async activate(wallet: string): Promise<ActivateResponseDto> {
    let user = await this.userRepository.findOne({ where: { wallet: wallet } });
    if (!user) {
      throw new NotFoundException(`User with address ${wallet} not found`);
    }

    if (user.isDeveloper) {
      this.logger.log(`User ${wallet} is already an active developer.`);
      return { status: 'already_active', message: 'User is already an active developer.' };
    }

    this.logger.log(`Checking trustline for user ${wallet}...`);
    try {
      const accountLines = await this.xrplClient.request({
        command: 'account_lines',
        account: wallet,
        peer: this.issuerAddress,
      });

      const trustline = accountLines.result.lines.find(line => line.currency === this.currencyCode);

      if (trustline) {
        user.isDeveloper = true;
        await this.userRepository.save(user);
        this.logger.log(`User ${wallet} has been successfully activated as a developer.`);
        
        return {
          status: 'activated',
          message: 'Developer status successfully activated.',
        };
      } else {
        // 신뢰선이 존재하지 않으면, 에러 반환
        this.logger.warn(`User ${wallet} attempted to activate without a valid trustline.`);
        // 신뢰선 먼저 set하고 다시 시도하란뜻
        throw new ForbiddenException('A trustline for the platform token must be set before activating developer status.');
      }
    } catch (error) {
      // account_lines 조회 중 에러 발생 시 (예: 네트워크 문제)
      this.logger.error(`Failed to check trustlines for ${wallet}`, error);
      throw new ServiceUnavailableException('Failed to verify trustline with the XRP Ledger.');
    }
  }
}

