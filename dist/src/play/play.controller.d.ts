import { PlayService } from './play.service';
import { StartPlayDto, StartPlayResponseDto, HeartbeatResponseDto } from './dto/start-play.dto';
export declare class PlayController {
    private readonly playService;
    constructor(playService: PlayService);
    start(dto: StartPlayDto, userId: string): Promise<StartPlayResponseDto>;
    heartbeat(req: any): Promise<HeartbeatResponseDto>;
    stop(req: any): Promise<void>;
}
