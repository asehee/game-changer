import { Controller, Get, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChainService } from './chain.service';
import { TokenMetadataResponseDto } from './dto/token-metadata-response.dto';
import { SendSignedTxResponseDto, SendSignedTxRequestDto } from './dto/send-signed-tx.dto';

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
}