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
        wallet: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
        status: 'ACTIVE',
        connectedWallet: null,
        tempWallet: null,
        isFirstChargeCompleted: false,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
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
        wallet: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
        status: 'ACTIVE',
        connectedWallet: null,
        tempWallet: null,
        isFirstChargeCompleted: false,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
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
    example: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 조회 성공',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        wallet: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
        status: 'ACTIVE',
        connectedWallet: null,
        tempWallet: null,
        isFirstChargeCompleted: false,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '해당 지갑 주소의 사용자를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with wallet 0x742d35Cc6635C0532925a3b8D598544e15B9a0E6 not found'
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
        wallet: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
        status: 'ACTIVE',
        connectedWallet: null,
        tempWallet: null,
        isFirstChargeCompleted: false,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
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
        wallet: 'rKGPzJNr5HgP3HPpkkm4ofE1yTv6K2eLoV',
        status: 'ACTIVE',
        tempWallet: null,
        isFirstChargeCompleted: false,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
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

  @Post('wallet-connect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '지갑 연결',
    description: '연결된 지갑 주소를 수신하고 처리합니다'
  })
  @ApiResponse({
    status: 200,
    description: '지갑 연결 성공',
    type: WalletResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청: connectedAddress가 필요합니다',
  })
  async walletConnect(@Body() walletConnectDto: WalletConnectDto): Promise<WalletResponseDto> {
    const { connectedAddress } = walletConnectDto;
    
    console.log('📩 Received wallet address:', connectedAddress);
    
    const user = await this.usersService.findOrCreateByConnectedWallet(connectedAddress);
    
    return {
      success: true,
      received: connectedAddress,
    };
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
}