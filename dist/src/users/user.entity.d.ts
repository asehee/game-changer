import { UserStatus } from '../common/enums/user-status.enum';
import { PlaySession } from '../play/play-session.entity';
export declare class User {
    id: string;
    wallet: string;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    playSessions: PlaySession[];
}
