import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './game.entity';

@ApiTags('게임')
@Controller('api/games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '새 게임 생성',
    description: '플레이 세션에 사용할 수 있는 새 게임을 생성합니다.'
  })
  @ApiResponse({
    status: 201,
    description: '게임 생성 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청: 유효하지 않은 게임 데이터',
  })
  async createGame(@Body() createGameDto: CreateGameDto): Promise<Game> {
    return this.gamesService.create({
      title: createGameDto.title,
      version: createGameDto.version,
      isActive: true,
      developerAddress: createGameDto.developerAddress, // 추가
      ratePerSession: createGameDto.ratePerSession, // 추가된 부분
    });
  }

  @Get()
  @ApiOperation({ summary: '모든 활성 게임 조회' })
  @ApiResponse({
    status: 200,
    description: '활성 게임 목록',
  })
  async getAllGames(): Promise<Game[]> {
    return this.gamesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID로 게임 조회' })
  @ApiResponse({
    status: 200,
    description: '게임 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '게임을 찾을 수 없음',
  })
  async getGame(@Param('id') id: string): Promise<Game> {
    return this.gamesService.findById(id);
  }
}