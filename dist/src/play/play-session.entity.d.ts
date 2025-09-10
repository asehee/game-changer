import { SessionStatus } from '../common/enums/session-status.enum';
import { BillingStatus } from '../common/enums/billing-status.enum';
import { User } from '../users/user.entity';
import { Game } from '../games/game.entity';
export declare class PlaySession {
    id: string;
    userId: string;
    gameId: string;
    status: SessionStatus;
    expiresAt: Date;
    lastHeartbeatAt: Date;
    billingStatus: BillingStatus;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    game: Game;
}
