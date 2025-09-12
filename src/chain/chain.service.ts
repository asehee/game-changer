import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenMetadataResponseDto } from './dto/token-metadata-response.dto';

@Injectable()
export class ChainService {
  constructor(private readonly configService: ConfigService) {}

  getTokenMetadata(): TokenMetadataResponseDto {
    const serverSeed = this.configService.get<string>('SERVER_SEED');
    let serverAddress = '';
    
    if (serverSeed) {
      try {
        const xrpl = require('xrpl');
        serverAddress = xrpl.Wallet.fromSeed(serverSeed).address;
      } catch (error) {
        console.error('Error getting server address:', error);
      }
    }

    return {
      issuer_address: this.configService.get<string>('ISSUER_ADDRESS', 'PORTrJLaRNS4NMt8ZM8VJSiBN8sAPnnRupR77a'),
      token_currency_code: this.configService.get<string>('TOKEN_CURRENCY_CODE', 'USD'),
      testnet: this.configService.get<string>('TESTNET', 'wss://s.altnet.rippletest.net:51233'),
      server_address: serverAddress,
    };
  }
}