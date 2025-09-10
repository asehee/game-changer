import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaySession } from './play-session.entity';
import { PlayService } from './play.service';
import { PlayController } from './play.controller';
import { UsersModule } from '../users/users.module';
import { GamesModule } from '../games/games.module';
import { BillingModule } from '../billing/billing.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlaySession]),
    UsersModule,
    GamesModule,
    BillingModule,
    AuthModule,
  ],
  controllers: [PlayController],
  providers: [PlayService],
  exports: [PlayService],
})
export class PlayModule {}