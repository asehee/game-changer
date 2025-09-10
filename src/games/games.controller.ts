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

@ApiTags('Games')
@Controller('api/games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new game',
    description: 'Creates a new game that can be used for play sessions.'
  })
  @ApiResponse({
    status: 201,
    description: 'Game created successfully',
    type: Game,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid game data',
  })
  async createGame(@Body() createGameDto: CreateGameDto): Promise<Game> {
    return this.gamesService.create({
      title: createGameDto.title,
      version: createGameDto.version,
      isActive: createGameDto.isActive ?? true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all active games' })
  @ApiResponse({
    status: 200,
    description: 'List of active games',
    type: [Game],
  })
  async getAllGames(): Promise<Game[]> {
    return this.gamesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID' })
  @ApiResponse({
    status: 200,
    description: 'Game found',
    type: Game,
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found',
  })
  async getGame(@Param('id') id: string): Promise<Game> {
    return this.gamesService.findById(id);
  }
}