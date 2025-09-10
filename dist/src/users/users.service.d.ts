import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findById(id: string): Promise<User>;
    findByWallet(wallet: string): Promise<User | null>;
    create(wallet: string): Promise<User>;
    findOrCreate(wallet: string): Promise<User>;
    isUserActive(userId: string): Promise<boolean>;
    blockUser(userId: string): Promise<User>;
    unblockUser(userId: string): Promise<User>;
}
