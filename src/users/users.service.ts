import { Injectable, NotFoundException, BadRequestException, ServiceUnavailableException, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserStatus } from '../common/enums/user-status.enum';
import { BalanceResponseDto } from './dto/check-balance.dto';
import { ActivateDeveloperResponseDto } from './dto/activate-developer.dto';
import { SubmitTrustlineResponseDto } from './dto/submit-trustline.dto';
import * as xrpl from 'xrpl';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly xrplClient: xrpl.Client; // XRPL 클라이언트 인스턴스
  private readonly issuerAddress: string;
  private readonly currencyCode: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
      // 환경 변수 가져오기
      this.issuerAddress = this.configService.get<string>('ISSUER_ADDRESS', 'PORTrJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a');
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
        status: UserStatus.ACTIVE,
      });
      user = await this.userRepository.save(user);
    }
    return user;
  }

  async checkTempWalletBalance(connectedWallet: string): Promise<BalanceResponseDto> {
    let user = await this.findByConnectedWallet(connectedWallet);
    if (!user) {
      throw new NotFoundException(`User with address ${connectedWallet} not found`);
    }

    const tempAddress = user.tempWallet; // user 엔티티에 tempWalletAddress 컬럼이 있다고 가정
    if (!tempAddress) {
      throw new NotFoundException(`Temporary wallet not yet created for user ${connectedWallet}`);
    }

    let balances: xrpl.Balance[]; // getBalances의 반환 타입을 명시
    try {
        // 2. XRPL 네트워크에 임시 지갑의 잔액을 조회합니다.
        balances = await this.xrplClient.getBalances(tempAddress);
    } catch (error) {
        // 네트워크 통신에 문제가 있거나, 주소가 활성화되지 않은 경우 등의 오류를 처리합니다.
        this.logger.error(`Failed to get balances for address: ${tempAddress}`, error);
        // 클라이언트에게는 서비스 자체의 문제임을 알립니다.
        throw new ServiceUnavailableException('Could not retrieve balances from the XRP Ledger.');
    }
    const xrpBalance = balances.find(b => b.currency === 'XRP')?.value || '0';
    const iou = balances.find(b => b.currency === this.currencyCode && b.issuer === this.issuerAddress);

    return {
        tempWalletAddress: tempAddress,
        xrpBalance,
        tokenBalance: {
            value: iou?.value || '0',
            currency: this.currencyCode,
            issuer: this.issuerAddress
        },
    };
  }

  async activateDeveloper(walletAddress: string): Promise<ActivateDeveloperResponseDto> {
    let user = await this.findByConnectedWallet(walletAddress);
    if (!user) {
      throw new NotFoundException(`User with address ${walletAddress} not found`);
    }

    if (user.isDeveloper) {
      return { status: 'already_active', message: 'User is already an active developer.' };
    }
    
    const accountLines = await this.xrplClient.request({
      command: 'account_lines',
      account: walletAddress,
      peer: this.issuerAddress,
    });

    const trustline = accountLines.result.lines.find(line => line.currency === this.currencyCode);

    // 2. 신뢰선이 이미 존재하는 경우
    if (trustline) {
      user.isDeveloper = true;
      await this.userRepository.save(user);      
      return { status: 'activated', message: 'Developer status has been activated.' };
    }

    // 3. 신뢰선이 없는 경우: 서명이 필요한 TrustSet 트랜잭션을 생성하여 반환
    const trustSetTx = {
      TransactionType: 'TrustSet',
      Account: walletAddress,
      LimitAmount: {
        issuer: this.issuerAddress,
        currency: this.currencyCode,
        value: '10000000000', // 충분히 큰 값으로 설정
      },
    };

    return { 
      status: 'pending_trustline',
      message: 'Please sign this transaction to become a developer.',
      transaction: trustSetTx
    };
  }

  async submitTrustlineAndActivate(walletAddress: string, signedTx: string): Promise<SubmitTrustlineResponseDto> {
    let user = await this.findByConnectedWallet(walletAddress);
    if (!user) {
      throw new NotFoundException(`User with address ${walletAddress} not found`);
    }

    this.logger.log(`Submitting TrustSet transaction for user ${walletAddress}`);
    try {
      const result = await this.xrplClient.submitAndWait(signedTx);
      const meta = result.result.meta;
      if (typeof meta === 'object' && meta !== null && 'TransactionResult' in meta) {
        if (meta.TransactionResult !== 'tesSUCCESS') {
          // 트랜잭션이 실패한 경우
          this.logger.error('Trustline submission failed on ledger', result);
          throw new BadRequestException(`Transaction failed on ledger: ${meta.TransactionResult}`);
        }
      } else {
        // 예상치 못한 응답 형식
        throw new BadRequestException('Unexpected response format from XRPL.');
      }
      
      user.isDeveloper = true;
      await this.userRepository.save(user);
      
      this.logger.log(`User ${user.id} has been successfully activated as a developer.`);

      return {
        status: 'activated',
        message: 'Developer status successfully activated.',
      };

    } catch (error) {
      this.logger.error(`Failed to get submit signed trustset transction for address: ${walletAddress}`, error);
    }
  }
}