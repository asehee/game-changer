import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PlaySession } from './play-session.entity';
import { UsersService } from '../users/users.service';
import { GamesService } from '../games/games.service';
import { BillingService } from '../billing/billing.service';
import { BillingStatus } from '../common/enums/billing-status.enum';
export declare class PlayService {
    private readonly sessionRepository;
    private readonly usersService;
    private readonly gamesService;
    private readonly billingService;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(sessionRepository: Repository<PlaySession>, usersService: UsersService, gamesService: GamesService, billingService: BillingService, jwtService: JwtService, configService: ConfigService);
    startSession(userId: string, gameId: string): Promise<{
        sessionToken: string;
        heartbeatIntervalSec: number;
    }>;
    heartbeat(sessionId: string, userId: string, gameId: string): Promise<string>;
    stopSession(sessionId: string, userId: string): Promise<void>;
    assertSessionActive(sessionId: string, userId: string, gameId: string): Promise<void>;
    revokeSession(sessionId: string, reason: BillingStatus): Promise<void>;
    cleanupExpiredSessions(): Promise<void>;
    private endPreviousSessions;
    private signSessionJwt;
}
