import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DevelopersService } from './developers.service';
import { ActivateRequestDto, ActivateResponseDto } from './dto/activate.dto';

@ApiTags('개발자')
@Controller('developers')
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: '개발자 대시보드 조회',
    description: '개발자의 전체 통계, 게임 목록, 최근 세션 정보를 조회합니다.'
  })
  @ApiQuery({
    name: 'wallet',
    description: '개발자 지갑 주소',
    example: '0x742d35Cc6634C0532925a3b8D56b1234567890Ab'
  })
  @ApiResponse({
    status: 200,
    description: '개발자 대시보드 정보',
    schema: {
      type: 'object',
      properties: {
        developer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            wallet: { type: 'string' },
            isDeveloper: { type: 'boolean' }
          }
        },
        overview: {
          type: 'object',
          properties: {
            totalRevenue: { type: 'number' },
            todayRevenue: { type: 'number' },
            totalGames: { type: 'number' },
            activeGames: { type: 'number' },
            totalPlayers: { type: 'number' },
            totalSessions: { type: 'number' },
            totalPlayTime: { type: 'number' }
          }
        },
        games: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              status: { type: 'string' },
              approvalStatus: { type: 'string' },
              playerCount: { type: 'number' },
              totalSessions: { type: 'number' },
              pricePerSecond: { type: 'number' },
              rating: { type: 'number' },
              createdAt: { type: 'string' }
            }
          }
        },
        recentSessions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              gameTitle: { type: 'string' },
              userWallet: { type: 'string' },
              activePlayTime: { type: 'number' },
              totalCost: { type: 'number' },
              status: { type: 'string' },
              createdAt: { type: 'string' },
              endedAt: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '개발자를 찾을 수 없음' })
  async getDeveloperDashboard(@Query('wallet') walletAddress: string) {
    if (!walletAddress) {
      throw new BadRequestException('지갑 주소가 필요합니다.');
    }

    try {
      return await this.developersService.getDeveloperDashboard(walletAddress);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('games/:gameId/analytics')
  @ApiOperation({
    summary: '게임별 상세 분석',
    description: '특정 게임의 상세 통계 및 일별 데이터를 조회합니다.'
  })
  @ApiParam({
    name: 'gameId',
    description: '게임 ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiQuery({
    name: 'wallet',
    description: '개발자 지갑 주소',
    example: '0x742d35Cc6634C0532925a3b8D56b1234567890Ab'
  })
  @ApiResponse({
    status: 200,
    description: '게임 분석 데이터',
    schema: {
      type: 'object',
      properties: {
        game: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            pricePerSecond: { type: 'number' },
            rating: { type: 'number' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string' }
          }
        },
        overview: {
          type: 'object',
          properties: {
            totalRevenue: { type: 'number' },
            totalSessions: { type: 'number' },
            uniquePlayers: { type: 'number' },
            avgPlayTime: { type: 'number' },
            totalPlayTime: { type: 'number' }
          }
        },
        dailyStats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              revenue: { type: 'number' },
              sessions: { type: 'number' },
              players: { type: 'number' },
              avgPlayTime: { type: 'number' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '게임을 찾을 수 없거나 접근 권한 없음' })
  async getGameAnalytics(
    @Param('gameId') gameId: string,
    @Query('wallet') walletAddress: string,
  ) {
    if (!walletAddress) {
      throw new BadRequestException('지갑 주소가 필요합니다.');
    }

    try {
      return await this.developersService.getGameAnalytics(gameId, walletAddress);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('start-uploading')
  @ApiOperation({
    summary: '게임 업로드 시작',
    description: '사용자를 개발자로 등록하고 게임 업로드를 준비합니다.'
  })
  @ApiQuery({
    name: 'wallet',
    description: '지갑 주소',
    example: '0x742d35Cc6634C0532925a3b8D56b1234567890Ab'
  })
  async startUploading(@Query('wallet') walletAddress: string) {
    if (!walletAddress) {
      throw new BadRequestException('지갑 주소가 필요합니다.');
    }

    try {
      const user = await this.developersService.updateDeveloperStatus(walletAddress, true);
      return {
        success: true,
        message: '게임 업로드를 시작할 수 있습니다.',
        user: {
          id: user.id,
          wallet: user.wallet,
          isDeveloper: user.isDeveloper
        }
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '서명된 TrustSet 트랜잭션을 제출하여 개발자를 최종 활성화 (인증 없음)' })
  @ApiResponse({ status: 200, description: '개발자 활성화 성공', type: ActivateResponseDto })
  @ApiResponse({ status: 400, description: '트랜잭션 제출 실패 또는 잘못된 서명' })
  async submitTrustline(
    @Body() activateDto: ActivateRequestDto,
  ): Promise<ActivateResponseDto> {
    
    // 🔥 3. DTO에서 필요한 값들을 추출하여 서비스로 전달합니다.
    return this.developersService.activate(
      activateDto.walletAddress, 
      activateDto.signedTransaction
    );
  }

}