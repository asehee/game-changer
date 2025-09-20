import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, ServiceUnavailableException, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserStatus } from '../common/enums/user-status.enum';
import { BalanceResponseDto } from './dto/check-balance.dto';
import { RewardResponseDto } from './dto/rewards.dto';
import * as xrpl from 'xrpl';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly xrplClient: xrpl.Client; // XRPL 클라이언트 인스턴스
  private readonly issuerAddress: string;
  private readonly currencyCode: string;
  private readonly serverWallet: xrpl.Wallet;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
      // 환경 변수 가져오기
      this.serverWallet = xrpl.Wallet.fromSeed(this.configService.get<string>('SERVER_SEED'));
      this.issuerAddress = this.configService.get<string>('ISSUER_ADDRESS', 'rJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a');
      this.currencyCode = this.configService.get<string>('TOKEN_CURRENCY_CODE', 'USD');
      //서비스가 초기화될 때 XRPL 클라이언트를 생성하고 연결
      this.xrplClient = new xrpl.Client(this.configService.get<string>('TESTNET', 'wss://s.altnet.rippletest.net:51233'));
      this.xrplClient.connect().then(() => { this.logger.log('XRPL Client connected successfully.');});
  }

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
    user.wallet = connectedWallet;
    return this.userRepository.save(user);
  }

  async findByConnectedWallet(wallet: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { wallet } });
  }

  async setTempWallet(userId: string, tempWallet: string): Promise<User> {
    const user = await this.findById(userId);
    if (user.isFirstChargeCompleted) {
      throw new ConflictException('First charge has already been completed for this user');
    }
    user.isFirstChargeCompleted = true;
    user.tempWallet = tempWallet;
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
        status: UserStatus.ACTIVE,
      });
      user = await this.userRepository.save(user);
    }
    return user;
  }

  async checkTempWalletBalance(connectedWallet: string): Promise<BalanceResponseDto> {
    const user = await this.findByConnectedWallet(connectedWallet);
    if (!user) {
      this.logger.warn(`User not found for wallet: ${connectedWallet}`);
      throw new NotFoundException(`User with wallet ${connectedWallet} not found.`);
    }

    const tempWallet = user.tempWallet;
    if (!tempWallet) {
      this.logger.warn(`Temp wallet not found for user: ${user.id}`);
      throw new NotFoundException(`Temporary wallet not yet created for this user.`);
    }

    // XRPL 조회 실패 시 503 Service Unavailable 에러
    let balances: xrpl.Balance[];
    try {
      balances = await this.xrplClient.getBalances(tempWallet);
    } catch (error) {
      this.logger.error(`Failed to get balances for address: ${tempWallet}`, error);
      throw new ServiceUnavailableException('Could not connect to the XRP Ledger to fetch balances.');
    }
    
    // (방어 코드) balances가 배열이 아닐 경우 500 Internal Server 에러
    if (!Array.isArray(balances)) {
      this.logger.error(`Unexpected response format from getBalances for ${tempWallet}`, balances);
      throw new InternalServerErrorException('Received an unexpected response format.');
    }
    
    const xrpBalance = balances.find(b => b.currency === 'XRP')?.value || '0';
    const iouBalanceInfo = balances.find(b => b.currency === this.currencyCode && b.issuer === this.issuerAddress);

    return {
        tempWallet: tempWallet,
        xrpBalance: xrpBalance,
        tokenBalance: iouBalanceInfo?.value.toString() || '0'
    };
  }

  async grantAdReward(userAddress: string): Promise<RewardResponseDto> {
    const rewardAmountXRP = this.configService.get<string>('AD_REWARD_XRP', '0.1'); // 기본값 0.1 XRP
    const user = await this.findByConnectedWallet(userAddress);
    if (!user) {
      this.logger.warn(`User not found for wallet: ${userAddress}`);
      throw new NotFoundException(`User with wallet ${userAddress} not found.`);
    }

    const tempWallet = user.tempWallet;
    if (!tempWallet) {
      this.logger.warn(`Temp wallet not found for user: ${user.id}`);
      throw new NotFoundException(`Temporary wallet not yet created for this user.`);
    }

    // 2. Payment 트랜잭션을 생성
    const paymentTx: xrpl.Payment = {
      TransactionType: 'Payment',
      Account: this.serverWallet.address, // 보내는 사람: 서버 지갑
      Destination: tempWallet,      // 받는 사람: 사용자 지갑
      Amount: xrpl.xrpToDrops(rewardAmountXRP), // 보상 금액 (drop 단위로 변환)
    };

    try {
      // 3. 트랜잭션을 제출하고 결과 대기
      const result = await this.xrplClient.submitAndWait(paymentTx, { wallet: this.serverWallet });

      // 4. 최종 결과 확인
      const meta = result.result.meta;
      if (typeof meta === 'object' && meta !== null && 'TransactionResult' in meta) {
        if (meta.TransactionResult !== "tesSUCCESS") {
          this.logger.error('Payment transaction failed', result);
          throw new InternalServerErrorException(`Payment failed: ${meta.TransactionResult}`);
        }
      } else {
        this.logger.error('Payment transaction failed with unexpected metadata format', result);
        throw new InternalServerErrorException('Payment failed due to an unexpected response format.');
      }

      this.logger.log(`Successfully sent ${rewardAmountXRP} XRP to ${tempWallet}. Tx Hash: ${result.result.hash}`);
      
      // 5. 성공 응답을 반환
      return {
        status: 'success',
        amount: rewardAmountXRP,
        transactionHash: result.result.hash,
      };

    } catch (error) {
      this.logger.error(`Failed to grant reward to ${tempWallet}`, error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(`Failed to submit transaction: ${error.message}`);
      }
      throw error;
    }
  }
}