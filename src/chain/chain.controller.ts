import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChainService } from './chain.service';
import { TokenMetadataResponseDto } from './dto/token-metadata-response.dto';

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
}