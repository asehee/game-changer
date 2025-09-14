import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { WalletConnectDto } from './dto/wallet-connect.dto';
import { FirstChargeDto } from './dto/first-charge.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { BalanceRequestDto, BalanceResponseDto  } from './dto/check-balance.dto';
import { ActivateDeveloperRequestDto, ActivateDeveloperResponseDto } from './dto/activate-developer.dto';
import { SubmitTrustlineRequestDto, SubmitTrustlineResponseDto } from './dto/submit-trustline.dto';
import { RewardRequestDto,RewardResponseDto } from './dto/rewards.dto';
import { User } from './user.entity';

@ApiTags('사용자')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '지갑 주소로 새 사용자 생성',
    description: '제공된 지갑 주소로 새 사용자를 생성합니다. 이미 존재하는 지갑이면 실패합니다.'
  })
  @ApiResponse({
    status: 201,
    description: '사용자 생성 성공',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        wallet: 'rhyPxjcZeYJyMk8f8qF7QL4mids65arMnB',
        status: 'ACTIVE',
        tempWallet: null,
        isFirstChargeCompleted: false,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        isDeveloper: false,
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict: User with this wallet address already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'User with this wallet address already exists'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청: 유효하지 않은 지갑 주소 형식',
    schema: {
      example: {
        statusCode: 400,
        message: ['Invalid wallet address format'],
        error: 'Bad Request'
      }
    }
  })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto.walletAddress);
  }

  @Post('find-or-create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '기존 사용자 찾기 또는 신규 생성 (권장)',
    description: '지갑이 발견되면 기존 사용자를 반환하고, 없으면 새로 생성합니다. 여러 번 호출해도 안전합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 찾기 또는 생성 성공',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        wallet: 'rhyPxjcZeYJyMk8f8qF7QL4mids65arMnB',
        status: 'ACTIVE',
        tempWallet: null,
        isFirstChargeCompleted: false,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        isDeveloper: false,
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청: 유효하지 않은 지갑 주소 형식',
    schema: {
      example: {
        statusCode: 400,
        message: ['Invalid wallet address format'],
        error: 'Bad Request'
      }
    }
  })
  async findOrCreateUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.findOrCreate(createUserDto.walletAddress);
  }

  @Get('wallet/:walletAddress')
  @ApiOperation({ summary: '지갑 주소로 사용자 찾기' })
  @ApiParam({
    name: 'walletAddress',
    description: '지갑 주소',
    example: 'rhyPxjcZeYJyMk8f8qF7QL4mids65arMnB',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 조회 성공',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        wallet: 'rhyPxjcZeYJyMk8f8qF7QL4mids65arMnB',
        status: 'ACTIVE',
        tempWallet: null,
        isFirstChargeCompleted: false,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        isDeveloper: false,
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '해당 지갑 주소의 사용자를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with wallet rhyPxjcZeYJyMk8f8qF7QL4mids65arMnB not found'
      }
    }
  })
  async findByWallet(@Param('walletAddress') walletAddress: string): Promise<User> {
    const user = await this.usersService.findByWallet(walletAddress);
    if (!user) {
      throw new NotFoundException(`User with wallet ${walletAddress} not found`);
    }
    return user;
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID로 사용자 찾기' })
  @ApiParam({
    name: 'id',
    description: '사용자 UUID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 조회 성공',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        wallet: 'rhyPxjcZeYJyMk8f8qF7QL4mids65arMnB',
        status: 'ACTIVE',
        tempWallet: null,
        isFirstChargeCompleted: false,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        isDeveloper: false,
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 550e8400-e29b-41d4-a716-446655440000 not found'
      }
    }
  })
  async findById(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Get('profile')
  @ApiOperation({ summary: '마이프로필 조회' })
  @ApiQuery({
    name: 'user_id',
    description: '사용자 UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: User,
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        wallet: 'rhyPxjcZeYJyMk8f8qF7QL4mids65arMnB',
        status: 'ACTIVE',
        tempWallet: null,
        isFirstChargeCompleted: false,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        isDeveloper: false,
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 550e8400-e29b-41d4-a716-446655440000 not found'
      }
    }
  })
  async getMyProfile(@Query('user_id') userId: string): Promise<User> {
    if (!userId) {
      throw new NotFoundException('user_id is required');
    }
    return this.usersService.findById(userId);
  }

  @Post('first-charge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '임시 주소로 첫 충전 처리',
    description: '첫 충전을 위한 임시 지갑 주소와 연결된 지갑 주소를 처리합니다'
  })
  @ApiResponse({
    status: 200,
    description: '첫 충전 처리 성공',
    type: WalletResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청: tempAddress 및 connectedWallet이 필요합니다',
  })
  async firstCharge(@Body() firstChargeDto: FirstChargeDto): Promise<WalletResponseDto> {
    const { tempAddress, connectedWallet } = firstChargeDto;
  
    if (!tempAddress || !connectedWallet) {
      return { success: false, received: null };
    }
  
    // wallet으로 기존 유저 조회
    let user = await this.usersService.findByWallet(connectedWallet);
  
    if (user) {
      // 기존 유저라면 tempWallet 업데이트
      await this.usersService.setTempWallet(user.id, tempAddress);
    } else {
      // 없으면 새 유저 생성
      user = await this.usersService.create(connectedWallet);
      await this.usersService.setTempWallet(user.id, tempAddress);
    }
  
    return {
      success: true,
      received: tempAddress,
    };
  }

  @Post('balance') // 🔥 1. POST /api/users/balance 로 변경
  @HttpCode(HttpStatus.OK) // 성공 시 200 OK 상태 코드 반환
  @ApiOperation({ summary: "사용자의 임시 지갑 잔액 조회 (인증 없음)" })
  @ApiResponse({ status: 200, description: "잔액 조회 성공", type: BalanceResponseDto })
  @ApiResponse({ status: 404, description: "사용자 또는 임시 지갑을 찾을 수 없음" })
  async getTempWalletBalance(
    // 🔥 2. @Param 대신 @Body를 사용하여 요청 본문에서 데이터를 가져옵니다.
    @Body() balanceRequestDto: BalanceRequestDto,
  ): Promise<BalanceResponseDto> {
    // 🔥 3. DTO에서 walletAddress를 추출하여 서비스로 전달합니다.
    return this.usersService.checkTempWalletBalance(balanceRequestDto.walletAddress);
  }

  @Post('developer/activate')
  @ApiOperation({ summary: "현재 사용자를 개발자로 활성화" })
  @ApiResponse({ status: 200, type: ActivateDeveloperResponseDto })
  async activateDeveloperStatus( 
    @Body() ActivateDeveloperRequestDto: ActivateDeveloperRequestDto,
    ): Promise<ActivateDeveloperResponseDto> {
    return this.usersService.activateDeveloper(ActivateDeveloperRequestDto.walletAddress);
  }

  @Post('developer/submit-trustline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '서명된 TrustSet 트랜잭션을 제출하여 개발자를 최종 활성화 (인증 없음)' })
  @ApiResponse({ status: 200, description: '개발자 활성화 성공', type: SubmitTrustlineResponseDto })
  @ApiResponse({ status: 400, description: '트랜잭션 제출 실패 또는 잘못된 서명' })
  async submitTrustline(
    @Body() submitDto: SubmitTrustlineRequestDto,
  ): Promise<SubmitTrustlineResponseDto> {
    
    // 🔥 3. DTO에서 필요한 값들을 추출하여 서비스로 전달합니다.
    return this.usersService.submitTrustlineAndActivate(
      submitDto.walletAddress, 
      submitDto.signedTransaction
    );
  }

  @Post('rewards')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '광고 시청 보상 지급 (XRP)', description: '서버 지갑에서 사용자 지갑으로 소량의 XRP를 전송합니다.' })
  @ApiResponse({ status: 200, description: "보상 지급 성공", type: RewardResponseDto })
  @ApiResponse({ status: 500, description: "서버 오류 또는 트랜잭션 실패" })
  async grantReward(
    @Body() rewardRequestDto: RewardRequestDto,
  ): Promise<RewardResponseDto> {
    return this.usersService.grantAdReward(rewardRequestDto.walletAddress);
  }
}