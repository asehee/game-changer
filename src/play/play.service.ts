import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PlaySession } from './play-session.entity';
import { UsersService } from '../users/users.service';
import { GamesService } from '../games/games.service';
import { BillingService } from '../billing/billing.service';
import { SessionStatus } from '../common/enums/session-status.enum';
import { BillingStatus } from '../common/enums/billing-status.enum';
import { SessionJwtPayload } from '../auth/session-jwt.strategy';
import { UserStatus } from '../common/enums/user-status.enum';

@Injectable()
export class PlayService {
  private readonly logger = new Logger(PlayService.name);

  constructor(
    @InjectRepository(PlaySession)
    private readonly sessionRepository: Repository<PlaySession>,
    private readonly usersService: UsersService,
    private readonly gamesService: GamesService,
    private readonly billingService: BillingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async startSession(userId: string, gameId: string): Promise<{ sessionToken: string; heartbeatIntervalSec: number }> {
    const user = await this.usersService.findById(userId);
    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('User is blocked');
    }

    const game = await this.gamesService.findActiveById(gameId);
    if (!game) {
      throw new NotFoundException('Game not found or inactive');
    }

    const billingStatus = await this.billingService.check(userId);
    if (billingStatus !== BillingStatus.OK) {
      throw new ForbiddenException('Billing check failed');
    }

    await this.endPreviousSessions(userId);

    const ttlSeconds = this.configService.get<number>('SESSION_JWT_TTL_SEC', 300);
    const heartbeatInterval = this.configService.get<number>('HEARTBEAT_INTERVAL_SEC', 45);

    const session = this.sessionRepository.create({
      userId,
      gameId,
      status: SessionStatus.ACTIVE,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
      lastHeartbeatAt: new Date(),
      billingStatus: BillingStatus.OK,
    });

    const savedSession = await this.sessionRepository.save(session);

    await this.billingService.startBillingStream(savedSession.id, userId);

    const sessionToken = this.signSessionJwt({
      sid: savedSession.id,
      uid: userId,
      gid: gameId,
      hb: heartbeatInterval,
    });

    this.logger.log(`Session started: ${savedSession.id} for user ${userId} game ${gameId}`);

    return {
      sessionToken,
      heartbeatIntervalSec: heartbeatInterval,
    };
  }

  async heartbeat(sessionId: string, userId: string, gameId: string): Promise<string> {
    const session = await this.sessionRepository.findOne({
      where: {
        id: sessionId,
        userId,
        gameId,
        status: SessionStatus.ACTIVE,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!session) {
      this.logger.warn(`Heartbeat failed: session ${sessionId} not found or expired`);
      throw new UnauthorizedException('Session not found or expired');
    }

    if (session.tokenRenewalCount >= 3) {
      this.logger.warn(`Heartbeat failed: session ${sessionId} exceeded renewal limit`);
      await this.revokeSession(sessionId, BillingStatus.STOPPED);
      throw new ForbiddenException('Token renewal limit exceeded');
    }

    const billingStatus = await this.billingService.checkStream(sessionId);
    if (billingStatus !== BillingStatus.OK) {
      await this.revokeSession(sessionId, BillingStatus.STOPPED);
      throw new ForbiddenException('Billing stream check failed');
    }

    const ttlSeconds = this.configService.get<number>('SESSION_JWT_TTL_SEC', 300);
    const heartbeatInterval = this.configService.get<number>('HEARTBEAT_INTERVAL_SEC', 45);

    session.lastHeartbeatAt = new Date();
    session.expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    session.billingStatus = billingStatus;
    session.tokenRenewalCount += 1;

    await this.sessionRepository.save(session);

    const newToken = this.signSessionJwt({
      sid: sessionId,
      uid: userId,
      gid: gameId,
      hb: heartbeatInterval,
    });

    this.logger.log(`Heartbeat success: session ${sessionId}, renewal count: ${session.tokenRenewalCount}`);

    return newToken;
  }

  async stopSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: {
        id: sessionId,
        userId,
        status: SessionStatus.ACTIVE,
      },
    });

    if (!session) {
      return;
    }

    session.status = SessionStatus.ENDED;
    await this.sessionRepository.save(session);

    await this.billingService.stopBillingStream(sessionId);

    this.logger.log(`Session stopped: ${sessionId}`);
  }

  async assertSessionActive(sessionId: string, userId: string, gameId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: {
        id: sessionId,
        userId,
        gameId,
        status: SessionStatus.ACTIVE,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session not active');
    }

    const billingStatus = await this.billingService.checkStream(sessionId);
    if (billingStatus !== BillingStatus.OK) {
      await this.revokeSession(sessionId, billingStatus);
      throw new ForbiddenException('Billing check failed');
    }
  }

  async revokeSession(sessionId: string, reason: BillingStatus): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      return;
    }

    session.status = SessionStatus.REVOKED;
    session.billingStatus = reason;
    await this.sessionRepository.save(session);

    await this.billingService.stopBillingStream(sessionId);

    this.logger.warn(`Session revoked: ${sessionId}, reason: ${reason}`);
  }

  async cleanupExpiredSessions(): Promise<void> {
    const expiredSessions = await this.sessionRepository.find({
      where: {
        status: SessionStatus.ACTIVE,
        expiresAt: LessThan(new Date()),
      },
    });

    for (const session of expiredSessions) {
      session.status = SessionStatus.EXPIRED;
      await this.sessionRepository.save(session);
      await this.billingService.stopBillingStream(session.id);
      this.logger.log(`Session expired: ${session.id}`);
    }
  }

  private async endPreviousSessions(userId: string): Promise<void> {
    const activeSessions = await this.sessionRepository.find({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
      },
    });

    for (const session of activeSessions) {
      session.status = SessionStatus.ENDED;
      await this.sessionRepository.save(session);
      await this.billingService.stopBillingStream(session.id);
    }
  }

  private signSessionJwt(payload: SessionJwtPayload): string {
    const ttlSeconds = this.configService.get<number>('SESSION_JWT_TTL_SEC', 300);
    return this.jwtService.sign(payload, {
      expiresIn: `${ttlSeconds}s`,
    });
  }
}