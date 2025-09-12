import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { WalletConnectDto } from './dto/wallet-connect.dto';
import { FirstChargeDto } from './dto/first-charge.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { User } from './user.entity';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new user with wallet address',
    description: 'Creates a new user with the provided wallet address. Fails if wallet already exists.'
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        wallet: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
        status: 'ACTIVE',
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
    description: 'Bad Request: Invalid wallet address format (must be 42 chars, start with 0x)',
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
    summary: 'Find existing user or create new one (recommended)',
    description: 'Returns existing user if wallet found, creates new user if not found. Safe to call multiple times.'
  })
  @ApiResponse({
    status: 200,
    description: 'User found or created successfully',
    type: User,
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        wallet: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
        status: 'ACTIVE',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid wallet address format (must be 42 chars, start with 0x)',
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
  @ApiOperation({ summary: 'Find user by wallet address' })
  @ApiParam({
    name: 'walletAddress',
    description: 'Ethereum wallet address (42 characters starting with 0x)',
    example: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: User,
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        wallet: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
        status: 'ACTIVE',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found with this wallet address',
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
  @ApiOperation({ summary: 'Find user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: User,
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        wallet: '0x742d35Cc6635C0532925a3b8D598544e15B9a0E6',
        status: 'ACTIVE',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
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

  @Post('wallet-connect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Connect wallet address',
    description: 'Receives and processes a connected wallet address'
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet connected successfully',
    type: WalletResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: connectedAddress is required',
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
    summary: 'Process first charge with temporary address',
    description: 'Receives and processes a temporary wallet address for first charge'
  })
  @ApiResponse({
    status: 200,
    description: 'First charge processed successfully',
    type: WalletResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: tempAddress is required',
  })
  async firstCharge(@Body() firstChargeDto: FirstChargeDto): Promise<WalletResponseDto> {
    const { tempAddress } = firstChargeDto;
    
    console.log('📩 Received temp wallet address:', tempAddress);
    
    const existingUser = await this.usersService.findByTempWallet(tempAddress);
    if (existingUser) {
      return {
        success: true,
        received: tempAddress,
      };
    }
    
    const user = await this.usersService.create(tempAddress);
    await this.usersService.setTempWallet(user.id, tempAddress);
    
    return {
      success: true,
      received: tempAddress,
    };
  }
}