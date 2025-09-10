import { Repository } from 'typeorm';
import { Game } from './game.entity';
export declare class GamesService {
    private readonly gameRepository;
    constructor(gameRepository: Repository<Game>);
    findById(id: string): Promise<Game>;
    findActiveById(id: string): Promise<Game>;
    findAll(): Promise<Game[]>;
    create(data: Partial<Game>): Promise<Game>;
    update(id: string, data: Partial<Game>): Promise<Game>;
    deactivate(id: string): Promise<Game>;
    activate(id: string): Promise<Game>;
}
