import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  async findById(id: string): Promise<Game> {
    const game = await this.gameRepository.findOne({ where: { id } });
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }
    return game;
  }

  async findActiveById(id: string): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { id, isActive: true },
    });
    if (!game) {
      throw new NotFoundException(`Active game with ID ${id} not found`);
    }
    return game;
  }

  async findAll(): Promise<Game[]> {
    return this.gameRepository.find({ 
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findByGenre(genre: string): Promise<Game[]> {
    return this.gameRepository.find({
      where: { genre, isActive: true },
      order: { rating: 'DESC', playerCount: 'DESC' }
    });
  }

  async create(data: Partial<Game>): Promise<Game> {
    const game = this.gameRepository.create(data);
    return this.gameRepository.save(game);
  }

  async update(id: string, data: Partial<Game>): Promise<Game> {
    const game = await this.findById(id);
    Object.assign(game, data);
    return this.gameRepository.save(game);
  }

  async deactivate(id: string): Promise<Game> {
    const game = await this.findById(id);
    game.isActive = false;
    return this.gameRepository.save(game);
  }

  async activate(id: string): Promise<Game> {
    const game = await this.findById(id);
    game.isActive = true;
    return this.gameRepository.save(game);
  }
}