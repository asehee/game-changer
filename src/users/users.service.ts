import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserStatus } from '../common/enums/user-status.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByWallet(wallet: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { wallet } });
  }

  async create(wallet: string): Promise<User> {
    const existingUser = await this.findByWallet(wallet);
    if (existingUser) {
      throw new ConflictException('User with this wallet address already exists');
    }
    
    const user = this.userRepository.create({
      wallet,
      status: UserStatus.ACTIVE,
    });
    return this.userRepository.save(user);
  }

  async findOrCreate(wallet: string): Promise<User> {
    let user = await this.findByWallet(wallet);
    if (!user) {
      user = await this.create(wallet);
    }
    return user;
  }

  async isUserActive(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user.status === UserStatus.ACTIVE;
  }

  async blockUser(userId: string): Promise<User> {
    const user = await this.findById(userId);
    user.status = UserStatus.BLOCKED;
    return this.userRepository.save(user);
  }

  async unblockUser(userId: string): Promise<User> {
    const user = await this.findById(userId);
    user.status = UserStatus.ACTIVE;
    return this.userRepository.save(user);
  }

  async updateConnectedWallet(userId: string, connectedWallet: string): Promise<User> {
    const user = await this.findById(userId);
    user.connectedWallet = connectedWallet;
    return this.userRepository.save(user);
  }

  async findByConnectedWallet(connectedWallet: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { connectedWallet } });
  }

  async setTempWallet(userId: string, tempWallet: string): Promise<User> {
    const user = await this.findById(userId);
    if (user.isFirstChargeCompleted) {
      throw new ConflictException('First charge has already been completed for this user');
    }
    user.tempWallet = tempWallet;
    return this.userRepository.save(user);
  }

  async completeFirstCharge(userId: string): Promise<User> {
    const user = await this.findById(userId);
    user.isFirstChargeCompleted = true;
    return this.userRepository.save(user);
  }

  async findByTempWallet(tempWallet: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { tempWallet } });
  }

  async findOrCreateByConnectedWallet(connectedWallet: string): Promise<User> {
    let user = await this.findByConnectedWallet(connectedWallet);
    if (!user) {
      user = this.userRepository.create({
        wallet: connectedWallet,
        connectedWallet,
        status: UserStatus.ACTIVE,
      });
      user = await this.userRepository.save(user);
    }
    return user;
  }
}