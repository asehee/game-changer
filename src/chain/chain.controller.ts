import { Controller, Get, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChainService } from './chain.service';
import { TokenMetadataResponseDto } from './dto/token-metadata-response.dto';
import { SendSignedTxResponseDto, SendSignedTxRequestDto } from './dto/send-signed-tx.dto';
import { TokenFaucetDto } from './dto/tokenfaucet.dto';

@ApiTags('블록체인')
@Controller('api/chain')
export class ChainController {
  constructor(private readonly chainService: ChainService) {}

  @Get('token-metadata')
  @ApiOperation({ summary: '토큰 메타데이터 조회' })
  @ApiResponse({
    status: 200,
    description: '토큰 메타데이터 조회 성공',
    type: TokenMetadataResponseDto,
  })
  getTokenMetadata(): TokenMetadataResponseDto {
    return this.chainService.getTokenMetadata();
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '서명된 트랜잭션을 네트워크에 제출' })
  @ApiResponse({ status: 200, description: "트랜잭션 제출 성공", type: SendSignedTxResponseDto })
  @ApiResponse({ status: 400, description: "트랜잭션 제출 실패 또는 잘못된 서명" })
  async submitSignedTransaction(
    @Body() sendSignedTxDto: SendSignedTxRequestDto,
  ): Promise<SendSignedTxResponseDto> {
    // 로그를 위해 txType과 walletAddress도 넘겨줄 수 있습니다.
    return this.chainService.submitTransaction(
      sendSignedTxDto.signedTransaction,
      sendSignedTxDto.txType,
      sendSignedTxDto.walletAddress
    );
  }

  @Post('tokenfaucet')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '테스트 토큰 지급', 
    description: '서버의 자금 지갑에서 요청한 사용자에게 미리 정의된 양의 테스트 IOU 토큰을 전송합니다.' 
  })
  @ApiResponse({ status: 200, description: '토큰 지급 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 500, description: '서버 내부 오류 또는 트랜잭션 실패' })
  async tokenFaucet(
    @Body() tokenFaucetDto: TokenFaucetDto,
  ): Promise<{ status: string; hash: string; }> {
    return this.chainService.tokenFaucet(tokenFaucetDto.walletAddress);
  }
}