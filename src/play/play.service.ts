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
import { TEMP_BASE_RESERVE, BASE_FEE } from '../config/xrpl.constants'; 
import * as xrpl from 'xrpl';

@Injectable()
export class PlayService {
  private readonly logger = new Logger(PlayService.name);
  private readonly xrplClient: xrpl.Client; // XRPL 클라이언트 인스턴스
  private readonly serverWallet: xrpl.Wallet;
  private readonly issuerAddress: string;
  private readonly currencyCode: string;

  constructor(
    @InjectRepository(PlaySession)
    private readonly sessionRepository: Repository<PlaySession>,
    private readonly usersService: UsersService,
    private readonly gamesService: GamesService,
    private readonly billingService: BillingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
      // 환경 변수 가져오기
      try {
        this.serverWallet = xrpl.Wallet.fromSeed(this.configService.get<string>('SERVER_SEED'));
      } catch (error) {
        this.logger.warn('Invalid SERVER_SEED, using dummy wallet');
        this.serverWallet = xrpl.Wallet.generate();
      }
      this.issuerAddress = this.configService.get<string>('ISSUER_ADDRESS', 'PORTrJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a');
      this.currencyCode = this.configService.get<string>('TOKEN_CURRENCY_CODE', 'USD');
      //서비스가 초기화될 때 XRPL 클라이언트를 생성하고 연결
      this.xrplClient = new xrpl.Client(this.configService.get<string>('TESTNET', 'wss://s.altnet.rippletest.net:51233'));
      this.xrplClient.connect().then(() => { this.logger.log('XRPL Client connected successfully.');});
  }
  
  private async _executePayment(
    tempAddress: string,
    developerAddress: string,
    ratePerSession: number,
  ): Promise<string> {
    console.log(tempAddress)
    const balances = await this.xrplClient.getBalances(tempAddress);
    console.log(balances)
    const tokenBalance = balances.find(b => b.currency === this.currencyCode && b.issuer === this.issuerAddress);
    const xrpBalance = balances.find(b => b.currency === 'XRP');

    const requiredFeeXRP = (BASE_FEE * 3) / 1000000;
    if (!tokenBalance || parseFloat(tokenBalance.value) < ratePerSession) {
        throw new ForbiddenException(`Insufficient IOU token balance(${tokenBalance}). Required: ${ratePerSession}`);
    }
    if (!xrpBalance || parseFloat(xrpBalance.value) < requiredFeeXRP + TEMP_BASE_RESERVE) {
        throw new ForbiddenException(`Insufficient XRP (${xrpBalance}) for transaction fee. Required: ~${requiredFeeXRP} XRP`);
    }
    this.logger.log('Balance check passed.');

    const paymentTx: xrpl.Payment = {
      TransactionType: "Payment",
      Account: tempAddress,
      Destination: developerAddress,
      Amount: {
        issuer: this.issuerAddress,
        currency: this.currencyCode,
        value: ratePerSession.toString(),
      },
    };
    this.logger.log(`Executing payment from ${tempAddress} to ${developerAddress} for ${ratePerSession} ${this.currencyCode}`);
    const preparedTx = await this.xrplClient.autofill(paymentTx);
    preparedTx.Fee = (parseInt(preparedTx.Fee) * 3).toString();

    const signed = this.serverWallet.sign(preparedTx, true);
    const result = await this.xrplClient.submitAndWait(signed.tx_blob);

    const meta = result.result.meta;
    if (typeof meta === 'object' && meta !== null && 'TransactionResult' in meta) {
      if (meta.TransactionResult !== "tesSUCCESS") {
        this.logger.error('Payment transaction failed', result);
        throw new ForbiddenException(`Payment failed: ${meta.TransactionResult}`);
      }
    } else {
      this.logger.error('Payment transaction failed with unexpected metadata format', result);
      throw new ForbiddenException('Payment failed due to an unexpected response format.');
    }
    this.logger.log(`Payment successful! Tx Hash: ${result.result.hash}`);
    return result.result.hash; // 성공 시 트랜잭션 해시 반환
  }

  async startSession(walletAddress: string, gameId: string): Promise<{ sessionToken: string; heartbeatIntervalSec: number }> {
    const user = await this.usersService.findOrCreate(walletAddress);
    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('User is blocked');
    }

    const game = await this.gamesService.findActiveById(gameId);
    if (!game) {
      throw new NotFoundException('Game not found or inactive');
    }
    const { ratePerSession, developerId } = game;
    const developer = await this.usersService.findById(developerId);

    // 결제 로직 추가
    if (!user.tempWallet) {
      this.logger.error(`User ${user.id} has no temporary wallet for payment.`);
      throw new ForbiddenException(`User ${user.id} does not have a temporary wallet set up.`);
    }
    await this._executePayment(user.tempWallet, developer.wallet, ratePerSession);

    await this.endPreviousSessions(user.id);

    const ttlSeconds = this.configService.get<number>('SESSION_JWT_TTL_SEC', 300);
    const heartbeatInterval = this.configService.get<number>('HEARTBEAT_INTERVAL_SEC', 45);

    const session = this.sessionRepository.create({
      userId: user.id,
      gameId,
      status: SessionStatus.ACTIVE,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
      lastHeartbeatAt: new Date(),
      billingStatus: BillingStatus.OK,
    });

    const savedSession = await this.sessionRepository.save(session);

    await this.billingService.startBillingStream(savedSession.id, user.id);

    const sessionToken = this.signSessionJwt({
      sid: savedSession.id,
      uid: user.id,
      gid: gameId,
      hb: heartbeatInterval,
    });

    this.logger.log(`Session started: ${savedSession.id} for user ${user.id} (${walletAddress}) game ${gameId}`);

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

    const game = await this.gamesService.findActiveById(gameId);
    if (!game) {
      throw new NotFoundException('Game not found or inactive');
    }
    const { ratePerSession, developerId } = game;
    const user = await this.usersService.findById(userId);
    const developer = await this.usersService.findById(developerId);
    // 결제 로직 추가
    if (!user.tempWallet) {
      this.logger.error(`User ${userId} has no temporary wallet for payment.`);
      throw new ForbiddenException(`User ${userId} does not have a temporary wallet set up.`);
    }
    await this._executePayment(user.tempWallet, developer.wallet, ratePerSession);

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