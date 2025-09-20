import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CrowdFundingService } from './crowd-funding.service';
import { CrowdFundingListDto } from './dto/crowd-funding-list.dto';
import { CrowdFundingDetailDto } from './dto/crowd-funding-detail.dto';
import { EscrowTxDto, EscrowTxResponseDto } from './dto/escrow-tx.dto';

@ApiTags('crowd-funding')
@Controller('api/crowd-funding')
export class CrowdFundingController {
  constructor(private readonly crowdFundingService: CrowdFundingService) {}

  @Get()
  @ApiOperation({ 
    summary: '크라우드 펀딩 목록 조회', 
    description: '게임명, 펀딩진행률, 참여자 수, 투표 상태, 펀딩 상태를 포함한 크라우드 펀딩 목록을 반환합니다.' 
  })
  async getCrowdFundingList(): Promise<CrowdFundingListDto[]> {
    return this.crowdFundingService.getCrowdFundingList();
  }

  @Get(':crowdId')
  @ApiOperation({ 
    summary: '크라우드 펀딩 상세 정보 조회', 
    description: '크라우드 펀딩 ID로 개발자 지갑 주소, 시작/종료일, 조건 값을 조회합니다.' 
  })
  @ApiParam({
    name: 'crowdId',
    description: '크라우드 펀딩 ID',
    example: '1'
  })
  async getCrowdFundingDetail(@Param('crowdId') crowdId: string): Promise<CrowdFundingDetailDto> {
    return this.crowdFundingService.getCrowdFundingDetail(crowdId);
  }

  @Post('escrowTx')
  @ApiOperation({ 
    summary: '에스크로 트랜잭션 처리', 
    description: '서명된 에스크로 트랜잭션을 XRPL에 제출하고 escrow 테이블에 저장합니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '에스크로 트랜잭션 처리 성공',
  })
  async processEscrowTransaction(@Body() escrowTxDto: EscrowTxDto): Promise<EscrowTxResponseDto> {
    return this.crowdFundingService.processEscrowTransaction(escrowTxDto);
  }
}