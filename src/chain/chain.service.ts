import { Injectable, Logger, ForbiddenException, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenMetadataResponseDto } from './dto/token-metadata-response.dto';
import * as xrpl from 'xrpl';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChainService {
  private readonly logger = new Logger(ChainService.name);
  private readonly xrplClient: xrpl.Client;
  private readonly serverWallet: xrpl.Wallet;
  private readonly issuerAddress: string;
  private readonly currencyCode: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {
      try {
        this.serverWallet = xrpl.Wallet.fromSeed(this.configService.get<string>('SERVER_SEED'));
      } catch (error) {
        this.logger.warn('Invalid SERVER_SEED, using dummy wallet');
        this.serverWallet = xrpl.Wallet.generate();
      }
      this.issuerAddress = this.configService.get<string>('ISSUER_ADDRESS', 'rJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a');
      this.currencyCode = this.configService.get<string>('TOKEN_CURRENCY_CODE', 'USD');

      this.xrplClient = new xrpl.Client(this.configService.get<string>('TESTNET', 'wss://s.altnet.rippletest.net:51233'));
      this.xrplClient.connect().then(() => { this.logger.log('XRPL Client connected successfully.');});
  }

  getTokenMetadata(): TokenMetadataResponseDto {
    return {
      issuer_address: this.configService.get<string>('ISSUER_ADDRESS', 'rJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a'),
      token_currency_code: this.configService.get<string>('TOKEN_CURRENCY_CODE', 'USD'),
      testnet: this.configService.get<string>('TESTNET', 'wss://s.altnet.rippletest.net:51233'),
      server_address: this.serverWallet.address,
    };
  }

  async submitTransaction(
    signedTx: string,
    txType: string,
    walletAddress: string
  ): Promise<{ status: string; transactionHash: string; }> {
    
    this.logger.log(`[${walletAddress}] Submitting signed ${txType} transaction...`);

    try {
        const result = await this.xrplClient.submitAndWait(signedTx);
      
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
        
        const txHash = result.result.hash;
        this.logger.log(`[${walletAddress}] Transaction successful! Hash: ${txHash}`);

        return {
            status: 'success',
            transactionHash: txHash,
        };

    } catch (error) {
        this.logger.error(`[${walletAddress}] Failed to submit transaction`, error);
        if (error instanceof Error) {
            throw new BadRequestException(`Failed to submit transaction: ${error.message}`);
        }
        throw error;
    }
  }

  async sendTestTokenToTemp(userWallet: string): Promise<{ status: string; hash: string; }> {
    const user = await this.usersService.findByWallet(userWallet);
    if (!user) {
      throw new NotFoundException('User not found');
    } 
    const destinationAddress = userWallet;
    const faucetAmount = this.configService.get<string>('FAUCET_AMOUNT', '20'); // 기본 100개 지급

    this.logger.log(`Dispensing ${faucetAmount} ${this.currencyCode} to ${destinationAddress}`);

    const paymentTx: xrpl.Payment = {
      TransactionType: 'Payment',
      Account: this.serverWallet.address,
      Destination: destinationAddress,
      Amount: {
        issuer: this.issuerAddress,
        currency: this.currencyCode,
        value: faucetAmount,
      },
    };

    try {
      const result = await this.xrplClient.submitAndWait(paymentTx, { wallet: this.serverWallet });
      
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
      return {status: "Send Test Token Successfully", hash: result.result.hash}

    } catch (error) {
      this.logger.error('Failed to dispense faucet tokens', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async tokenFaucet(walletAddress: string): Promise<{ status: string; hash: string; }> {
    const user = await this.usersService.findByWallet(walletAddress);
    if (!user) {
      throw new NotFoundException('User not found');
    } 
    this.logger.log(walletAddress)
    const destinationAddress = walletAddress;
    const faucetAmount = this.configService.get<string>('FAUCET_AMOUNT', '20'); // 기본 100개 지급

    this.logger.log(`Dispensing ${faucetAmount} ${this.currencyCode} to ${destinationAddress}`);

    const paymentTx: xrpl.Payment = {
      TransactionType: 'Payment',
      Account: this.serverWallet.address,
      Destination: destinationAddress,
      Amount: {
        issuer: this.issuerAddress,
        currency: this.currencyCode,
        value: faucetAmount,
      },
    };

    try {
      const result = await this.xrplClient.submitAndWait(paymentTx, { wallet: this.serverWallet });
      
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
      return {status: "Send Test Token Successfully", hash: result.result.hash}

    } catch (error) {
      this.logger.error('Failed to dispense faucet tokens', error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
