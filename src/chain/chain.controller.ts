import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChainService } from './chain.service';
import { TokenMetadataResponseDto } from './dto/token-metadata-response.dto';

@ApiTags('Chain')
@Controller('api/chain')
export class ChainController {
  constructor(private readonly chainService: ChainService) {}

  @Get('token-metadata')
  @ApiOperation({ summary: 'Get token metadata information' })
  @ApiResponse({
    status: 200,
    description: 'Token metadata retrieved successfully',
    type: TokenMetadataResponseDto,
  })
  getTokenMetadata(): TokenMetadataResponseDto {
    return this.chainService.getTokenMetadata();
  }
}