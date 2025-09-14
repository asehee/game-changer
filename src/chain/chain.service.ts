import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenMetadataResponseDto } from './dto/token-metadata-response.dto';
import { Client } from 'xrpl';

@Injectable()
export class ChainService {
  private readonly logger = new Logger(ChainService.name);
  private readonly xrplClient: Client;

  constructor(private readonly configService: ConfigService) {
    this.xrplClient = new Client(this.configService.get<string>('TESTNET', 'wss://s.altnet.rippletest.net:51233'));
    this.xrplClient.connect().then(() => { this.logger.log('XRPL Client connected successfully.');});
  }

  getTokenMetadata(): TokenMetadataResponseDto {
    let serverAddress = '';
    
    try {
      const xrpl = require('xrpl');
      serverAddress = xrpl.Wallet.generate().address;
    } catch (error) {
      console.error('Error generating server address:', error);
    }

    return {
      issuer_address: this.configService.get<string>('ISSUER_ADDRESS', 'PORTrJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a'),
      token_currency_code: this.configService.get<string>('TOKEN_CURRENCY_CODE', 'USD'),
      testnet: this.configService.get<string>('TESTNET', 'wss://s.altnet.rippletest.net:51233'),
      server_address: serverAddress,
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
}
