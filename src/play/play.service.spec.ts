import { Test, TestingModule } from '@nestjs/testing';
import { PlayService } from './play.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlaySession } from './play-session.entity';
import { UsersService } from '../users/users.service';
import { GamesService } from '../games/games.service';
import { BillingService } from '../billing/billing.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserStatus } from '../common/enums/user-status.enum';
import { BillingStatus } from '../common/enums/billing-status.enum';
import { SessionStatus } from '../common/enums/session-status.enum';

describe('PlayService', () => {
  let service: PlayService;
  let sessionRepository: jest.Mocked<Repository<PlaySession>>;
  let usersService: jest.Mocked<UsersService>;
  let gamesService: jest.Mocked<GamesService>;
  let billingService: jest.Mocked<BillingService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayService,
        {
          provide: getRepositoryToken(PlaySession),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: GamesService,
          useValue: {
            findActiveById: jest.fn(),
          },
        },
        {
          provide: BillingService,
          useValue: {
            check: jest.fn(),
            checkStream: jest.fn(),
            startBillingStream: jest.fn(),
            stopBillingStream: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PlayService>(PlayService);
    sessionRepository = module.get(getRepositoryToken(PlaySession));
    usersService = module.get(UsersService);
    gamesService = module.get(GamesService);
    billingService = module.get(BillingService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  describe('startSession', () => {
    const userId = 'user-123';
    const gameId = 'game-456';

    beforeEach(() => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'SESSION_JWT_TTL_SEC') return 300;
        if (key === 'HEARTBEAT_INTERVAL_SEC') return 45;
        return null;
      });
    });

    it('should start a new session successfully', async () => {
      const mockUser = { id: userId, status: UserStatus.ACTIVE, wallet: 'wallet1' };
      const mockGame = { id: gameId, title: 'Test Game', isActive: true };
      const mockSession = { id: 'session-789', userId, gameId, status: SessionStatus.ACTIVE };

      usersService.findById.mockResolvedValue(mockUser as any);
      gamesService.findActiveById.mockResolvedValue(mockGame as any);
      billingService.check.mockResolvedValue(BillingStatus.OK);
      sessionRepository.find.mockResolvedValue([]);
      sessionRepository.create.mockReturnValue(mockSession as any);
      sessionRepository.save.mockResolvedValue(mockSession as any);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.startSession(userId, gameId);

      expect(result).toHaveProperty('sessionToken', 'mock-jwt-token');
      expect(result).toHaveProperty('heartbeatIntervalSec', 45);
      expect(billingService.startBillingStream).toHaveBeenCalledWith('session-789', userId);
    });

    it('should throw ForbiddenException if user is blocked', async () => {
      const mockUser = { id: userId, status: UserStatus.BLOCKED, wallet: 'wallet1' };
      usersService.findById.mockResolvedValue(mockUser as any);

      await expect(service.startSession(userId, gameId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if game is not active', async () => {
      const mockUser = { id: userId, status: UserStatus.ACTIVE, wallet: 'wallet1' };
      usersService.findById.mockResolvedValue(mockUser as any);
      gamesService.findActiveById.mockRejectedValue(new NotFoundException());

      await expect(service.startSession(userId, gameId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if billing check fails', async () => {
      const mockUser = { id: userId, status: UserStatus.ACTIVE, wallet: 'wallet1' };
      const mockGame = { id: gameId, title: 'Test Game', isActive: true };

      usersService.findById.mockResolvedValue(mockUser as any);
      gamesService.findActiveById.mockResolvedValue(mockGame as any);
      billingService.check.mockResolvedValue(BillingStatus.INSUFFICIENT);

      await expect(service.startSession(userId, gameId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('heartbeat', () => {
    const sessionId = 'session-123';
    const userId = 'user-456';
    const gameId = 'game-789';

    beforeEach(() => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'SESSION_JWT_TTL_SEC') return 300;
        if (key === 'HEARTBEAT_INTERVAL_SEC') return 45;
        return null;
      });
    });

    it('should renew session successfully', async () => {
      const mockSession = {
        id: sessionId,
        userId,
        gameId,
        status: SessionStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 60000),
      };

      sessionRepository.findOne.mockResolvedValue(mockSession as any);
      billingService.checkStream.mockResolvedValue(BillingStatus.OK);
      sessionRepository.save.mockResolvedValue(mockSession as any);
      jwtService.sign.mockReturnValue('new-jwt-token');

      const result = await service.heartbeat(sessionId, userId, gameId);

      expect(result).toBe('new-jwt-token');
      expect(sessionRepository.save).toHaveBeenCalled();
    });

    it('should revoke session if billing check fails', async () => {
      const mockSession = {
        id: sessionId,
        userId,
        gameId,
        status: SessionStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 60000),
      };

      sessionRepository.findOne.mockResolvedValue(mockSession as any);
      billingService.checkStream.mockResolvedValue(BillingStatus.STOPPED);

      await expect(service.heartbeat(sessionId, userId, gameId)).rejects.toThrow(ForbiddenException);
      expect(billingService.stopBillingStream).toHaveBeenCalledWith(sessionId);
    });
  });
});