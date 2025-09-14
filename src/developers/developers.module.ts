import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevelopersController } from './developers.controller';
import { DevelopersService } from './developers.service';
import { DeveloperStats } from './developer-stats.entity';
import { User } from '../users/user.entity';
import { Game } from '../games/game.entity';
import { PlaySession } from '../play/play-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeveloperStats,
      User,
      Game,
      PlaySession,
    ]),
  ],
  controllers: [DevelopersController],
  providers: [DevelopersService],
  exports: [DevelopersService],
})
export class DevelopersModule {}