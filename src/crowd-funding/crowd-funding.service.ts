import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CrowdFunding } from './crowd-funding.entity';
import { Escrow } from './escrow.entity';
import { Game } from '../games/game.entity';
import { User } from '../users/user.entity';
import { CrowdFundingListDto } from './dto/crowd-funding-list.dto';
import { CrowdFundingDetailDto } from './dto/crowd-funding-detail.dto';
import { EscrowTxDto, EscrowTxResponseDto } from './dto/escrow-tx.dto';
import { BatchFinishRequestDto, BatchFinishResponseDto, BatchCancelRequestDto, BatchCancelResponseDto } from './dto/batch';
import { encodeForSigning, encode } from 'ripple-binary-codec';
import { sign as kpSign, deriveKeypair } from 'ripple-keypairs';
import { CrowdFundingStatus } from './crowd-funding.entity'
import * as xrpl from 'xrpl';


@Injectable()
export class CrowdFundingService {
  private readonly logger = new Logger(CrowdFundingService.name);
  private readonly xrplClient: xrpl.Client;
  private readonly serverWallet: xrpl.Wallet;
  private readonly issuerAddress: string;
  private readonly currencyCode: string;
  private readonly condition: string;
  private readonly fulfillment: string;

  constructor(
    @InjectRepository(CrowdFunding)
    private readonly crowdFundingRepository: Repository<CrowdFunding>,
    @InjectRepository(Escrow)
    private readonly escrowRepository: Repository<Escrow>,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    this.condition = this.configService.get<string>('CONDITION', 'cf');
    this.fulfillment = this.configService.get<string>('FULFILLMENT', 'cf');
    this.serverWallet = xrpl.Wallet.fromSeed(this.configService.get<string>('SERVER_SEED'));
    this.issuerAddress = this.configService.get<string>('ISSUER_ADDRESS', 'rJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a');
    this.currencyCode = this.configService.get<string>('TOKEN_CURRENCY_CODE', 'USD');
    this.xrplClient = new xrpl.Client(this.configService.get<string>('TESTNET', 'wss://s.altnet.rippletest.net:51233'));
    this.xrplClient.connect().then(() => { 
      this.logger.log('XRPL Client connected successfully.');
    });

  }

  async getCrowdFundingList(): Promise<CrowdFundingListDto[]> {
    const crowdFundings = await this.crowdFundingRepository
      .createQueryBuilder('cf')
      .leftJoinAndSelect('cf.escrows', 'escrow')
      .orderBy('cf.createdAt', 'DESC')
      .getMany();

    const result: CrowdFundingListDto[] = [];

    for (const cf of crowdFundings) {
      // 게임 정보 조회
      const game = await this.gameRepository.findOne({
        where: { id: cf.gameId }
      });

      // 현재 펀딩 금액 계산
      const escrows = await this.escrowRepository.find({
        where: { crowdId: cf.id }
      });

      const currentAmount = escrows.reduce((sum, escrow) => {
        return sum + parseFloat(escrow.amount);
      }, 0);

      // 펀딩 진행률 계산 (0-100)
      const fundingProgress = Math.min(
        (currentAmount / parseFloat(cf.goalAmount)) * 100,
        100
      );

      // 참여자 수 계산 (unique userId)
      const uniqueUserIds = new Set(escrows.map(e => e.userId));
      const participantCount = uniqueUserIds.size;

      // 가장 최근 투표 상태 (해당 유저의 최신 투표)
      // 여기서는 임시로 abstain으로 설정 (실제로는 현재 로그인 유저의 투표 상태를 조회해야 함)
      const voteStatus = 'abstain' as any;

      result.push({
        id: cf.id,
        gameName: game?.title || 'Unknown Game',
        fundingProgress: Math.round(fundingProgress * 100) / 100,
        participantCount,
        voteStatus,
        fundingStatus: cf.status,
        goalAmount: cf.goalAmount,
        currentAmount: currentAmount.toString(),
        startDate: cf.startDate.toISOString(),
        endDate: cf.endDate.toISOString(),
      });
    }

    return result;
  }

  async getCrowdFundingDetail(crowdId: string): Promise<CrowdFundingDetailDto> {
    // 크라우드 펀딩 조회
    const crowdFunding = await this.crowdFundingRepository.findOne({
      where: { id: crowdId }
    });

    if (!crowdFunding) {
      throw new NotFoundException('Crowd funding not found');
    }

    // 개발자 정보 조회
    const developer = await this.userRepository.findOne({
      where: { id: crowdFunding.developerId }
    });

    if (!developer) {
      throw new NotFoundException('Developer not found');
    }

    // 환경변수에서 CONDITION 값 가져오기
    const condition = this.configService.get<string>('CONDITION');

    return {
      wallet: developer.wallet,
      startDate: crowdFunding.startDate.toISOString(),
      endDate: crowdFunding.endDate.toISOString(),
      condition: condition,
    };
  }

  async processEscrowTransaction(escrowTxDto: EscrowTxDto): Promise<EscrowTxResponseDto> {
    try {
        const crowdFunding = await this.crowdFundingRepository.findOne({
            where: { id: escrowTxDto.crowdId }
        });
        if (!crowdFunding) {
            throw new NotFoundException('Crowd funding not found');
        }

        const user = await this.userRepository.findOne({
            where: { id: escrowTxDto.userId }
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const developer = await this.userRepository.findOne({
            where: { id: crowdFunding.developerId }
        });
        if (!developer) {  // developer로 수정
            throw new NotFoundException('Developer not found');
        }

        if (!user.tempWallet || !developer.wallet) {
            throw new BadRequestException('user.tempWallet or developer.wallet information is missing');
        }

        if (!escrowTxDto.amount) {
            throw new BadRequestException('Amount is required');
        }

        const escrowCreateTx: xrpl.EscrowCreate = {
            TransactionType: "EscrowCreate",
            Account: user.tempWallet,
            Destination: developer.wallet,
            Amount: {
                currency: this.currencyCode,
                issuer: this.issuerAddress,
                value: escrowTxDto.amount,
            },
            Condition: this.condition,
            FinishAfter: Math.floor(crowdFunding.endDate.getTime() / 1000) - 946684800 + 10,
            CancelAfter: Math.floor(crowdFunding.endDate.getTime() / 1000) - 946684800 + 20000,
        };

        try {
            const preparedTx = await this.xrplClient.autofill(escrowCreateTx);
            
            if (!this.serverWallet?.publicKey || !this.serverWallet?.seed) {
                throw new InternalServerErrorException('Server wallet configuration is missing');
            }

            const txToSign = { ...preparedTx, SigningPubKey: this.serverWallet.publicKey };
            const { privateKey } = deriveKeypair(this.serverWallet.seed);
            const signingData = encodeForSigning(txToSign);
            const signature = kpSign(signingData, privateKey);
            const signedTx = { ...txToSign, TxnSignature: signature };

            const tx_blob = encode(signedTx);
            const escrowResult = await this.xrplClient.submitAndWait(tx_blob);
            const sequence = preparedTx.Sequence;

            const meta = escrowResult.result.meta;
            if (typeof meta === 'object' && meta !== null && 'TransactionResult' in meta) {
                if (meta.TransactionResult !== "tesSUCCESS") {
                    this.logger.error('Payment transaction failed', { 
                        error: escrowResult,
                        userId: escrowTxDto.userId,
                        crowdId: escrowTxDto.crowdId 
                    });
                    throw new InternalServerErrorException(`Payment failed: ${meta.TransactionResult}`);
                }

                // Escrow 테이블에 저장
                const escrow = this.escrowRepository.create({
                    userId: escrowTxDto.userId,
                    crowdId: escrowTxDto.crowdId,
                    amount: escrowTxDto.amount,
                    sequence: sequence,
                });

                const savedEscrow = await this.escrowRepository.save(escrow);

                return {
                    status: 'success',
                    escrowId: savedEscrow.id,
                };
            } else {
                throw new InternalServerErrorException('Invalid transaction result format');
            }

        } catch (error) {
            this.logger.error('XRPL transaction error', {
                error,
                userId: escrowTxDto.userId,
                crowdId: escrowTxDto.crowdId
            });
            throw new InternalServerErrorException(
                error.message || 'Failed to process XRPL transaction'
            );
        }
    } catch (error) {
        this.logger.error(`Failed to process escrow transaction`, {
            error,
            userId: escrowTxDto.userId,
            crowdId: escrowTxDto.crowdId
        });

        if (error instanceof BadRequestException || 
            error instanceof NotFoundException || 
            error instanceof InternalServerErrorException) {
            throw error;
        }

        throw new InternalServerErrorException('Failed to process escrow transaction');
    }
  }

  async sendBatchCancel(batchCancelDto: BatchCancelRequestDto): Promise<BatchCancelResponseDto> {
    const crowdFunding = await this.crowdFundingRepository.findOne({
        where: { id: batchCancelDto.crowdId }
    });
    if (!crowdFunding) {
        throw new NotFoundException('Crowd funding not found');
    }

    const escrows = await this.escrowRepository.find({
        where: { crowdId: batchCancelDto.crowdId }
    });

    if (!escrows.length) {
      throw new NotFoundException('Does not exsit any escrow');
    }

    console.log(`총 ${escrows.length}개의 EscrowFinish 트랜잭션을 준비합니다...`);
    const rawTransactions = await Promise.all(
      escrows.map(async (escrow) => {
        try {
            const user = await this.userRepository.findOne({ where: { id: escrow.userId }});
            if (!user) {throw new NotFoundException(`User not found for escrow ID: ${escrow.id}`);}
            if (!user.tempWallet) {throw new BadRequestException('user.tempWallet information is missing');}
            if (!escrow.sequence) {throw new BadRequestException(`Sequence not found for escrow ID: ${escrow.id}`);}
            return {
                TransactionType: 'EscrowCancel',
                Account: this.serverWallet.address,
                Owner: user.tempWallet,
                OfferSequence: escrow.sequence,
                Fee: "0",
                SigningPubKey: "",
                Flags: 0x40000000
            };
        } catch (error) {
            this.logger.error(`Error processing escrow ID: ${escrow.id}`, error);
            throw error;
        }
      })
    );
  
    const accountInfo = await this.xrplClient.request({command: "account_info", account: this.serverWallet.address});
    const baseSequence = accountInfo.result.account_data.Sequence;

    // create batch tx
    const batchTx: any = {
        TransactionType: "Batch",
        Account: this.serverWallet.address,
        Flags: 0x00080000, // 🔥 Independent 모드 플래그
        Sequence: baseSequence,
        RawTransactions: rawTransactions,
    };

    // 5. 서버 지갑으로 서명하고 제출합니다.
    const result = await this.xrplClient.submitAndWait(batchTx, { wallet: this.serverWallet });
    const meta = result.result.meta;
    if (typeof meta === 'object' && meta !== null && 'TransactionResult' in meta) {
      if (meta.TransactionResult !== "tesSUCCESS") {
          this.logger.error('Payment transaction failed', { 
              error: result,
              crowdId: batchCancelDto.crowdId 
          });
          throw new InternalServerErrorException(`Payment failed: ${meta.TransactionResult}`);
      } else {
        crowdFunding.status = CrowdFundingStatus.FINISHED
        await this.crowdFundingRepository.save(crowdFunding);

        return {
            status: 'success',
            batchTx: result.result.hash,
        };
      }
    }
  }

  async sendBatchFinish(batchFinishDto: BatchFinishRequestDto): Promise<BatchFinishResponseDto> {
    const crowdFunding = await this.crowdFundingRepository.findOne({
        where: { id: batchFinishDto.crowdId }
    });
    if (!crowdFunding) {
        throw new NotFoundException('Crowd funding not found');
    }

    const escrows = await this.escrowRepository.find({
        where: { crowdId: batchFinishDto.crowdId }
    });

    if (!escrows.length) {
      throw new NotFoundException('Does not exsit any escrow');
    }

    console.log(`총 ${escrows.length}개의 EscrowFinish 트랜잭션을 준비합니다...`);
    const rawTransactions = await Promise.all(
      escrows.map(async (escrow) => {
        try {
            const user = await this.userRepository.findOne({ where: { id: escrow.userId }});
            if (!user) {throw new NotFoundException(`User not found for escrow ID: ${escrow.id}`);}
            if (!user.tempWallet) {throw new BadRequestException('user.tempWallet information is missing');}
            if (!escrow.sequence) {throw new BadRequestException(`Sequence not found for escrow ID: ${escrow.id}`);}
            return {
                TransactionType: 'EscrowFinish',
                Account: this.serverWallet.address,
                Owner: user.tempWallet,
                OfferSequence: escrow.sequence,
                Condition: this.condition,
                Fulfillment: this.fulfillment,
                Fee: "0",
                SigningPubKey: "",
                Flags: 0x40000000
            };
        } catch (error) {
            this.logger.error(`Error processing escrow ID: ${escrow.id}`, error);
            throw error;
        }
      })
    );
  
    const accountInfo = await this.xrplClient.request({command: "account_info", account: this.serverWallet.address});
    const baseSequence = accountInfo.result.account_data.Sequence;

    // create batch tx
    const batchTx: any = {
        TransactionType: "Batch",
        Account: this.serverWallet.address,
        Flags: 0x00080000, // 🔥 Independent 모드 플래그
        Sequence: baseSequence,
        RawTransactions: rawTransactions,
    };

    // 5. 서버 지갑으로 서명하고 제출합니다.
    const result = await this.xrplClient.submitAndWait(batchTx, { wallet: this.serverWallet });
    const meta = result.result.meta;
    if (typeof meta === 'object' && meta !== null && 'TransactionResult' in meta) {
      if (meta.TransactionResult !== "tesSUCCESS") {
          this.logger.error('Payment transaction failed', { 
              error: result,
              crowdId: batchFinishDto.crowdId 
          });
          throw new InternalServerErrorException(`Payment failed: ${meta.TransactionResult}`);
      } else {
        crowdFunding.status = CrowdFundingStatus.FINISHED
        await this.crowdFundingRepository.save(crowdFunding);

        return {
            status: 'success',
            batchTx: result.result.hash,
        };
      }
    }
  }
}