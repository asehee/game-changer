import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CrowdFundingService } from './crowd-funding.service';
import { CrowdFundingListDto } from './dto/crowd-funding-list.dto';

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
}